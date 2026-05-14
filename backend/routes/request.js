import express from "express";
import bcrypt from "bcryptjs";

import Customer from "../models/Customer.js";
import Request from "../models/Request.js";
import Mechanic from "../models/Mechanic.js";
import sendEmail from "../utils/sendEmail.js";
import generateInvoice from "../utils/generateInvoice.js";

import { chooseBestMechanic } from "../ai/mechanicSelector.js";


const router = express.Router();

/* =====================================================
   CUSTOMER REQUEST
===================================================== */
router.post("/request-help", async (req, res) => {
  try {
    const { name, phone, email, problemType, lat, lng } = req.body;

    if (!name || !phone || !email || !problemType || lat == null || lng == null) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Save / update customer (NOW INCLUDING EMAIL)
    const customer = await Customer.findOneAndUpdate(
      { phone },
      { name, email },
      { upsert: true, new: true }
    );

// Fetch available mechanics
const mechanics = await Mechanic.find({ availability: true });

// AI selection
const selected = chooseBestMechanic(
  mechanics,
  problemType.toLowerCase(),
  { lat, lng }
);

let assignedMechanic = null;

if (selected) {
  assignedMechanic = selected.mechanic;

  assignedMechanic.workload += 1;

  // 🔧 reserve mechanic immediately
  assignedMechanic.availability = false;
  await assignedMechanic.save();
}

/* ===============================
   FIND 2 NEARBY MECHANICS (5KM)
================================= */

const toRadians = (deg) => deg * (Math.PI / 180);

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let nearbyMechanics = [];

if (assignedMechanic) {
  nearbyMechanics = mechanics
    .filter(m => m._id.toString() !== assignedMechanic._id.toString())
    .map(m => ({
      name: m.name,
      phone: m.phone,
      distance: calculateDistance(
        lat,
        lng,
        m.location.lat,
        m.location.lng
      )
    }))
    .filter(m => m.distance <= 5)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 2);
}

// Save request
const request = await Request.create({
  customerId: customer._id,
  customerEmail: email,
  problemType,
  location: { lat, lng },
  assignedMechanic: assignedMechanic?._id || null,
  status: assignedMechanic ? "assigned" : "searching"
});

/* =====================================================
   SEND EMAILS AFTER ASSIGNMENT
===================================================== */

if (assignedMechanic) {

  const mapLink = `https://www.google.com/maps/dir/?api=1&destination=${assignedMechanic.location.lat},${assignedMechanic.location.lng}`;

  const customerEmailHTML = `
  <div style="font-family: Arial; padding:20px;">
    <h2 style="color:#e53935;">👨🏻‍🔧🔧 Mechanic Assigned - Quick-ResQ</h2>

    <p>Hello ${customer.name},</p>

    <div style="background:#f5f5f5; padding:15px; border-left:5px solid #e53935;">
      <p><b>Assigned Mechanic:</b> ${assignedMechanic.name}</p>
      <p><b>Phone:</b> ${assignedMechanic.phone}</p>
      <p><b>Shop Address:</b> ${assignedMechanic.address || "Not Available"}</p>
    </div>

    ${
      nearbyMechanics.length > 0
        ? `
      <h3 style="margin-top:20px;">Other Nearby Mechanics (Within 5km)</h3>
      ${nearbyMechanics
        .map(
          m => `
            <p>
              <b>${m.name}</b> - ${m.phone} 
              (${m.distance.toFixed(1)} km away)
            </p>
          `
        )
        .join("")}
      `
        : ""
    }

    <br>

    <a href="${mapLink}"
       style="background:#43a047; color:white; padding:12px 20px; text-decoration:none; border-radius:6px;">
       View Location on Google Maps
    </a>

    <p style="margin-top:20px; font-size:13px; color:gray;">
      Thank you for choosing Quick-ResQ.
    </p>
  </div>
  `;

  await sendEmail(
    email,
    "Mechanic Assigned - Quick-ResQ",
    customerEmailHTML
  );

  /* -------------------- MECHANIC EMAIL -------------------- */

  const mechanicEmailHTML = `
  <div style="font-family: Arial; padding:20px;">
    <h2 style="color:#e53935;">🛠 New Service Request</h2>

    <div style="background:#f5f5f5; padding:15px; border-left:5px solid #e53935;">
      <p><b>Customer Name:</b> ${customer.name}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Problem:</b> ${problemType}</p>
      <p><b>Email:</b> ${email}</p>
    </div>

    <br>

    <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}"
       style="background:#1e88e5; color:white; padding:12px 20px; text-decoration:none; border-radius:6px;">
       Navigate to Customer Location
    </a>
  </div>
  `;

  await sendEmail(
    "mechanic1quickresq@gmail.com",
    "New Customer Request - Quick-ResQ",
    mechanicEmailHTML
  );
}

    res.json({
      requestId: request._id,
      status: request.status,
      mechanic: assignedMechanic
        ? {
            name: assignedMechanic.name,
            skills: assignedMechanic.skills.join(", "),
            distance: selected.distance,
            eta: selected.eta
          }
        : null
    });

  } catch (err) {
    console.error("Customer request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   MECHANIC LOGIN
===================================================== */
router.post("/mechanic/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    const mechanic = await Mechanic.findOne({ userId });
    if (!mechanic) {
      return res.status(401).json({ message: "Invalid userId" });
    }

    const isMatch = await bcrypt.compare(password, mechanic.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      mechanicId: mechanic._id,
      name: mechanic.name,
      skills: mechanic.skills
    });

  } catch (err) {
    console.error("Mechanic login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   MECHANIC DASHBOARD — FETCH ACTIVE JOBS
===================================================== */
router.get("/mechanic/jobs/:mechanicId", async (req, res) => {
  try {
    const jobs = await Request.find({
      assignedMechanic: req.params.mechanicId,
      status: {
        $in: ["assigned", "accepted", "on_the_way", "completed"]
      }
    }).populate("customerId");

    res.json(jobs);
  } catch (err) {
    console.error("Fetch mechanic jobs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   MECHANIC ACTIONS — ACCEPT / REJECT / ON_THE_WAY / COMPLETED
===================================================== */
router.post("/mechanic/job/:jobId", async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Request.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (status === "accepted") {
      job.status = "accepted";
      await job.save();
      return res.json({ message: "Job accepted" });
    }

    if (status === "on_the_way") {
      job.status = "on_the_way";
      await job.save();
      return res.json({ message: "Mechanic on the way" });
    }

if (status === "completed") {

  job.status = "completed";
  await job.save();

  // ✅ FIRST get customer
  const customer = await Customer.findById(job.customerId);

  // ✅ THEN generate invoice
  const invoicePath = await generateInvoice(job, customer);

  // ✅ Save invoice path
  job.invoicePath = `/invoices/invoice-${job._id}.pdf`;
  await job.save();

  // Make mechanic available again
  await Mechanic.findByIdAndUpdate(job.assignedMechanic, {
    availability: true
  });

  /* ===============================
     SEND COMPLETION EMAIL TO CUSTOMER
  =============================== */

  const completionHTML = `
  <div style="font-family: Arial; padding:20px;">
    <h2 style="color:#43a047;">✅ Service Completed - Quick-ResQ</h2>

    <p>Hello ${customer.name},</p>

    <div style="background:#f5f5f5; padding:15px; border-left:5px solid #43a047;">
      <p><b>Problem:</b> ${job.problemType}</p>
      <p><b>Status:</b> Completed</p>
    </div>

    <p style="margin-top:20px;">
      Thank you for choosing <b>Quick-ResQ</b>.
    </p>

    <p style="font-size:13px; color:gray;">
      Instant Help, Smart Assistance – Anywhere, Anytime.
    </p>
  </div>
  `;

  await sendEmail(
    job.customerEmail,
    "Service Completed - Invoice Attached",
    completionHTML,
    invoicePath
  );

  return res.json({ message: "Job completed & invoice sent" });
}

    if (status === "rejected") {

      await Mechanic.findByIdAndUpdate(job.assignedMechanic, {
        availability: false
      });

      const mechanics = await Mechanic.find({ availability: true });

      const selected = chooseBestMechanic(
        mechanics,
        job.problemType.toLowerCase(),
        job.location
      );

      if (!selected) {
        job.status = "no_mechanic";
        job.assignedMechanic = null;
        await job.save();
        return res.json({ message: "No mechanic available" });
      }

      job.assignedMechanic = selected.mechanic._id;
      job.status = "assigned";

      await Mechanic.findByIdAndUpdate(selected.mechanic._id, {
        availability: false
      });

      await job.save();

      return res.json({
        message: "Reassigned",
        mechanic: selected.mechanic.name
      });
    }

    res.status(400).json({ message: "Invalid status" });

  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   CUSTOMER — CHECK REQUEST STATUS
===================================================== */
router.get("/request-status/:id", async (req, res) => {
  try {
    const job = await Request.findById(req.params.id)
      .populate("assignedMechanic");

    if (!job) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({
  status: job.status,
  invoicePath: job.status === "completed" ? job.invoicePath : null,   // 🔹 ADD THIS
  mechanic: job.assignedMechanic
    ? { 
        name: job.assignedMechanic.name,
        phone: job.assignedMechanic.phone
      }
    : null
});
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

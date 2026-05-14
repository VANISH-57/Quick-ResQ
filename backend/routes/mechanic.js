import express from "express";
import bcrypt from "bcryptjs";
import Mechanic from "../models/Mechanic.js";

const router = express.Router();

router.post("/mechanic/signup", async (req, res) => {

  try {

    const { name, userId, password, phone, skills, lat, lng } = req.body;
    const existing = await Mechanic.findOne({ userId });

    if (existing) {
      return res.status(400).json({
        message: "User ID already exists"
      });
   }
    const hashedPassword = await bcrypt.hash(password, 10);

    const mechanic = new Mechanic({

      name,
      userId,
      password: hashedPassword,
      phone,

      skills,

      location: {
        lat,
        lng
      },

      availability: true,
      rating: 0,
      workload: 0

    });

    await mechanic.save();

    res.json({
      message: "Mechanic registered successfully"
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error"
    });

  }

});

export default router;
/* =====================================================
   QUICK-RESQ — SHARED SCRIPT (USER + MECHANIC)
   ===================================================== */

/* ---------------- INITIALIZE MECHANICS ---------------- */
if (!localStorage.getItem("mechanics")) {
  const mechanics = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Mechanic ${i + 1}`,
    skill: ["Puncture", "Engine", "Battery", "Towing"][i % 4],
    lat: 11 + Math.random() * 0.25,
    lng: 76.9 + Math.random() * 0.25,
    rating: (Math.random() * 2 + 3).toFixed(1),
    available: true
  }));
  localStorage.setItem("mechanics", JSON.stringify(mechanics));
}

/* ---------------- GLOBAL STATE ---------------- */
let userLat = null;
let userLng = null;

/* =====================================================
   USER-SIDE FUNCTIONS (index.html)
   ===================================================== */

/* 📍 Get live location */
function useLiveLocation() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      document.getElementById("userStatus").innerText =
        "📍 Live location captured";
    },
    () => alert("Location permission denied")
  );
}

/* 📏 Distance (Haversine) */
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ⏱ ETA calculation */
function calculateETA(distanceKm) {
  const avgSpeed = 40; // km/h
  return Math.ceil((distanceKm / avgSpeed) * 60);
}

/* 🤖 AI mechanic selection */
function chooseBestMechanic(problem) {
  const mechanics = JSON.parse(localStorage.getItem("mechanics"));
  let best = null;
  let bestScore = -1;

  mechanics
    .filter(m => m.available)
    .forEach(m => {
      const d = getDistance(userLat, userLng, m.lat, m.lng);
      const score =
        (1 / (d + 1)) * 0.4 +
        (m.skill === problem ? 1 : 0) * 0.3 +
        (m.rating / 5) * 0.3;

      if (score > bestScore) {
        bestScore = score;
        best = {
          ...m,
          distance: d.toFixed(2),
          eta: calculateETA(d)
        };
      }
    });

  return best;
}

/* 🚨 USER REQUEST HELP */
function requestHelp() {
  const problem = document.getElementById("problem").value;

  if (!problem) {
    alert("Please select a problem");
    return;
  }
  if (userLat === null || userLng === null) {
    alert("Please confirm location first");
    return;
  }

  const mech = chooseBestMechanic(problem);
  if (!mech) {
    alert("No mechanics available");
    return;
  }

  /* STORE JOB DATA */
  localStorage.setItem("assignedMech", JSON.stringify(mech));
  localStorage.setItem("problem", problem);
  localStorage.setItem("lat", userLat);
  localStorage.setItem("lng", userLng);
  localStorage.setItem("jobStatus", "PENDING");

  /* UPDATE USER UI */
  document.getElementById("mechanicInfo").classList.remove("hidden");
  document.getElementById("uName").innerText = mech.name;
  document.getElementById("uSkill").innerText = mech.skill;
  document.getElementById("uDistance").innerText = mech.distance;
  document.getElementById("uETA").innerText = mech.eta;
  document.getElementById("userStatus").innerText =
    "⏳ Waiting for mechanic response";

  /* 🔓 OPEN REAL MECHANIC PAGE */
  window.open("mechanic.html", "_blank");
}

/* 🔁 Update user when accepted */
setInterval(() => {
  const status = localStorage.getItem("jobStatus");
  if (status === "ACCEPTED") {
    document.getElementById("userStatus").innerText =
      "✅ Mechanic on the way 🚗";
  }
}, 1000);

/* =====================================================
   MECHANIC-SIDE FUNCTIONS (mechanic.html)
   ===================================================== */

let ringing = false;

/* 🔔 Listen for job */
function listenForJob() {
  setInterval(() => {
    const status = localStorage.getItem("jobStatus");
    const mech = JSON.parse(localStorage.getItem("assignedMech"));

    if (status === "PENDING" && mech) {
      document.getElementById("jobBox").style.display = "block";
      document.getElementById("mProblem").innerText =
        localStorage.getItem("problem");

      document.getElementById("mLocation").innerText =
        localStorage.getItem("lat") + ", " + localStorage.getItem("lng");

      document.getElementById("mETA").innerText = mech.eta;

      document.getElementById("mStatus").innerText =
        "🚨 New Job Assigned";

      if (!ringing) {
        document.getElementById("alertSound").play();
        ringing = true;
      }
    }

    if (status === "ACCEPTED") {
      document.getElementById("alertSound").pause();
      document.getElementById("alertSound").currentTime = 0;
      document.getElementById("mStatus").innerText =
        "✅ Job accepted. Navigate to customer.";
    }
  }, 1000);
}

/* ✅ ACCEPT JOB */
function acceptJob() {
  localStorage.setItem("jobStatus", "ACCEPTED");
}

/* ❌ REJECT JOB */
function rejectJob() {
  const mech = JSON.parse(localStorage.getItem("assignedMech"));
  let mechanics = JSON.parse(localStorage.getItem("mechanics"));

  mechanics = mechanics.map(m =>
    m.id === mech.id ? { ...m, available: false } : m
  );

  localStorage.setItem("mechanics", JSON.stringify(mechanics));

  localStorage.removeItem("assignedMech");
  localStorage.setItem("jobStatus", "REJECTED");

  ringing = false;
  document.getElementById("mStatus").innerText =
    "❌ Job rejected. Waiting for next request...";
}

/* 📍 Open Google Maps */
function openMap() {
  const lat = localStorage.getItem("lat");
  const lng = localStorage.getItem("lng");
  window.open(
    `https://www.google.com/maps?q=${lat},${lng}`,
    "_blank"
  );
}

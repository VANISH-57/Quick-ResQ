import bcrypt from "bcryptjs";
import Mechanic from "./models/Mechanic.js";
import "./db.js";

// random location around Coimbatore
function randomOffset() {
  return (Math.random() - 0.5) * 0.1;
}

const skillsPool = [
  ["puncture"],
  ["engine"],
  ["battery"],
  ["tow"],
  ["engine", "battery"]
];

async function seedMechanics() {
  try {
    await Mechanic.deleteMany({});

    const baseLat = 11.0168;
    const baseLng = 76.9558;

    const mechanics = [];

    for (let i = 1; i <= 25; i++) {
      const hashedPassword = await bcrypt.hash(`mech${i}@123`, 10);

      mechanics.push({
        userId: `mech${i}`,
        password: hashedPassword,
        name: `Mechanic ${i}`,
        skills: skillsPool[i % skillsPool.length],
        location: {
          lat: baseLat + randomOffset(),
          lng: baseLng + randomOffset()
        },
        availability: true,
        rating: Number((Math.random() * 2 + 3).toFixed(1)),
        workload: Math.floor(Math.random() * 3)
      });
    }

    await Mechanic.insertMany(mechanics);
    console.log("✅ 25 mechanics with login credentials created");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedMechanics();

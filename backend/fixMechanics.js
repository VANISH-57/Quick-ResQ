import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Mechanic from "./models/Mechanic.js";
import "./db.js";

const fixMechanics = async () => {
  const mechanics = await Mechanic.find();

  let count = 1;

  for (let mech of mechanics) {

    // assign clean userId like mech1, mech2...
    if (!mech.userId) {
      mech.userId = `mech${count}`;
    }

    // assign default password
    if (!mech.password) {
      mech.password = await bcrypt.hash("mech@123", 10);
    }

    await mech.save();
    count++;
  }

  console.log("✅ userId & password added to all mechanics");
  process.exit();
};

fixMechanics();

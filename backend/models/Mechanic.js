import mongoose from "mongoose";

const mechanicSchema = new mongoose.Schema({
  name: String,

  // 🔐 LOGIN FIELDS (MECHANIC ONLY)
  userId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  phone: {
  type: String,
  required: true,
  unique: true
  },

  skills: [String],
  location: {
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
},

  availability: {
    type: Boolean,
    default: true
  },

  rating: { 
    type: Number,
    default: 0
  },

  workload: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("Mechanic", mechanicSchema);

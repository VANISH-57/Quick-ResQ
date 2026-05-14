import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },

  // ✅ NEW FIELD ADDED
  customerEmail: {
    type: String,
    required: true
  },

  problemType: String,

  location: {
    lat: Number,
    lng: Number
  },

  assignedMechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mechanic",
    default: null
  },

  status: {
  type: String,
  default: "searching"
},

invoicePath: {
  type: String
},

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Request", requestSchema);


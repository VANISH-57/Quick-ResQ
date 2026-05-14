import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;

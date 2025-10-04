import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  name: { type: String },              // e.g., Home, Work
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zip: { type: String, required: true },
  phone: { type: String },             // optional, if different from user phone
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  rewards: [{ type: String }],
  addresses: [AddressSchema], 
});


const User = mongoose.model("User", UserSchema);

export default User;

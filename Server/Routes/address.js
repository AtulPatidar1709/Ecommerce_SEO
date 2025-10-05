import express from "express";
import User from "../modules/User_Schema.js";
import validate from "../middleware/validate.js";
import addressSchema from "../validations/addressValidation.js";

const addressRoutes = express.Router();

// Get all addresses
addressRoutes.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId).select("addresses");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ addresses: user.addresses });
});

// Add new address
addressRoutes.post("/:userId", validate(addressSchema), async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.addresses.push(req.body);
  await user.save();
  res.json({ ok: true, addresses: user.addresses });
});

addressRoutes.put("/:userId/:addressId", validate(addressSchema), async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ error: "Address not found" });

  Object.assign(addr, req.body);
  await user.save();
  res.json({ ok: true, addresses: user.addresses });
});

// Delete address
addressRoutes.delete("/:userId/:addressId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ error: "Address not found" });

  addr.remove();
  await user.save();
  res.json({ ok: true, addresses: user.addresses });
});

export default addressRoutes;

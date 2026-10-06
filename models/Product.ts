import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  legacyId: { type: String, unique: true, sparse: true, index: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, index: true },
  categorySlug: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "EUR" },
  image: { type: String, required: true },
  deals: { type: Number, default: 0 },
  vendorName: { type: String, required: true, default: "LMP", trim: true },
  vendorLevel: { type: Number, default: 1 },
  disputes: { type: Number, default: 0, min: 0 },
  verified: { type: Boolean, default: true },
  location: { type: String, default: "Europe" },
  details: { type: [String], default: [] },
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.index({ categorySlug: 1, status: 1 });
ProductSchema.index({ name: "text", description: "text" });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);

import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  productCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);

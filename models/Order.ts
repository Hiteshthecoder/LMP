import mongoose, { Schema } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  }],
  status: { type: String, enum: ["inquiry", "pending", "cancelled", "completed"], default: "inquiry", index: true },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "USD" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const FeedbackSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    sellerReply: { type: String, trim: true, maxlength: 1000, default: null },
    sellerReplyAt: { type: Date, default: null },
  },
  { timestamps: true },
);

FeedbackSchema.index({ productId: 1, createdAt: -1 });

export type FeedbackDocument = InferSchemaType<typeof FeedbackSchema> & { _id: mongoose.Types.ObjectId };
export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
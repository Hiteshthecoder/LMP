import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subject: { type: String, required: true, maxlength: 160 },
  message: { type: String, required: true, maxlength: 5000 },
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);

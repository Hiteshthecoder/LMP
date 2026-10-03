import mongoose, { Schema } from "mongoose";

const UserDeviceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  deviceId: { type: String, required: true, unique: true, index: true },
  publicJwk: { type: Schema.Types.Mixed, required: true },
  deviceName: { type: String, default: "Browser device", maxlength: 120 },
  lastAuthenticatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null },
});

export default mongoose.models.UserDevice || mongoose.model("UserDevice", UserDeviceSchema);

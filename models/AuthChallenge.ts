import mongoose, { Schema } from "mongoose";

const AuthChallengeSchema = new Schema({
  deviceId: { type: String, required: true, index: true },
  challengeHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

export default mongoose.models.AuthChallenge || mongoose.model("AuthChallenge", AuthChallengeSchema);

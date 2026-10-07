import mongoose, { Schema } from "mongoose";

const AuthChallengeSchema = new Schema({
  deviceId: { type: String, required: true, index: true },
  challengeHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// expiresAt is the actual challenge lifetime; TTL should follow it directly.
AuthChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.AuthChallenge || mongoose.model("AuthChallenge", AuthChallengeSchema);

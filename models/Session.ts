import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Every authenticated request starts with tokenHash. The unique index makes
// that lookup O(log n) and also guarantees that a token cannot be duplicated.
sessionSchema.index({ tokenHash: 1 }, { unique: true });

// Let MongoDB remove expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session || mongoose.model("Session", sessionSchema);

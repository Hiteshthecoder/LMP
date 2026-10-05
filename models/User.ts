import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 32 },
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  trustLevel: { type: Number, default: 1, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type UserDocument = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export default mongoose.models.User || mongoose.model("User", UserSchema);

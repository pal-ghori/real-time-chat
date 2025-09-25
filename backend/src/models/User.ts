import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>("User", UserSchema);

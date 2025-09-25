import mongoose, { Document, Schema } from "mongoose";

export interface IRoom extends Document {
  name: string;
  isPrivate: boolean;
  members: mongoose.Types.ObjectId[]; // user ids
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRoom>("Room", RoomSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  room: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model<IMessage>("Message", MessageSchema);

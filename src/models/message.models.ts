import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
}

const messageSchema: Schema<Message> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const messageModel = mongoose.model<Message>("message", messageSchema);
export default messageModel;

import mongoose, { Schema, Document } from "mongoose";
import { Message } from "./message.models";
import bcrypt from "bcryptjs";
import { messageSchema } from "@/schemas/messageSchema";

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  isAcceptingMessage: boolean;
  isVerified: boolean;
  verifyCode:string;
  verifyCodeExpiry:Date;
  isAcceptingMessages: boolean;
}

const userSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    isAcceptingMessage: {
      type: Boolean,
      default: false,
    },
    isVerified:{
      type:Boolean,
      default:false
    },
    verifyCode:{
        type:String
    },
    verifyCodeExpiry:{
        type:Date
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
      }
},{ timestamps: true },);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const userModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", userSchema);
export default userModel;

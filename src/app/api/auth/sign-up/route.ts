import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.models";
import { signUpSchema } from "@/schemas/signUpSchema";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";
import { randomInt } from "crypto";

const VERIFICATION_CODE_EXPIRY_IN_MS = 60 * 60 * 1000;

const generateVerificationCode = () => randomInt(100000, 1000000).toString();

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const requestBody = await request.json();
    const parsedRequestBody = signUpSchema.safeParse(requestBody);

    if (!parsedRequestBody.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsedRequestBody.error.issues[0]?.message ?? "Invalid signup data",
        },
        { status: 400 },
      );
    }

    const { username, email, password } = parsedRequestBody.data;

    const user = await userModel.findOne({ $or: [{ email }, { username }] });

    if (user) {
      if (user.email === email) {
        return NextResponse.json(
          { success: false, message: "Email is already registered" },
          { status: 409 },
        );
      }
      if (user.username === username) {
        return NextResponse.json(
          { success: false, message: "Username is already taken" },
          { status: 409 },
        );
      }
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(
      Date.now() + VERIFICATION_CODE_EXPIRY_IN_MS,
    );

    const newUser = await userModel.create({
      username,
      email,
      password,
      verifyCode: verificationCode,
      verifyCodeExpiry: verificationCodeExpiry,
      isVerified: false,
      isAcceptingMessage: true,
    });

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verificationCode,
    );

    console.log("EmailResponse:: ", emailResponse);
    // TODO:retry mechanism
    if (!emailResponse.success) {
      await userModel.findByIdAndDelete(newUser._id);
      return NextResponse.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error while registering user:", message);
    return NextResponse.json(
      {
        success: false,
        message: message,
      },
      { status: 500 },
    );
  }
}

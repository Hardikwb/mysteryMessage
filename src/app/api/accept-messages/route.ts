import { getServerSession, User } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import userModel from "@/models/user.models";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !session.user)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const userId = user?._id;

  const { acceptMessage } = await request.json();

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessage },
      { new: true },
    );
    if (!updatedUser)
      return NextResponse.json(
        { success: false, message: "Failed to load user status to accept messages" },
        { status: 401 },
      );

    return NextResponse.json(
      {
        success: true,
        message: "Message Status updated successfully",
        updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Failed to load user status to accept messages :: ", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const foundUser = await userModel.findById(user._id);

    if (!foundUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error retrieving message acceptance status" },
      { status: 500 },
    );
  }
}

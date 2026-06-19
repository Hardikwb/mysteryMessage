import { getServerSession, User } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import userModel from "@/models/user.models";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import messageModel from "@/models/message.models";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // if (!session || !session.user)
  //   return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const userId = user?._id;
  const PAGE_SIZE = 20;
  const page = Number(request.nextUrl.searchParams.get("page")) || 1;

  try {
    const [messages, total] = await Promise.all([
      messageModel
        .find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE),
      messageModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        messages,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / PAGE_SIZE),
          hasMore: page * PAGE_SIZE < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error while fetching messages:", errorMessage);
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 },
    );
  }
}

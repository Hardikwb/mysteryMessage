import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import messageModel from "@/models/message.models";
import { messageIdSchema, messageSchema } from "@/schemas/messageSchema";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.models";
export async function POST(request: NextRequest) {
  await dbConnect();
  // const session = await getServerSession(authOptions);
  // const user = session?.user;
  // if (!session || !user)
  //   return NextResponse.json(
  //     { message: "User not authenticated" },
  //     { status: 401 },
  //   );
  // if (!session.user.isVerified)
  //   return NextResponse.json({ message: "User not verified" }, { status: 401 });

  const { username, content } = await request.json();

  try {
    const verifiedContent = messageSchema.safeParse({ content, username });
    if (!verifiedContent.success) {
      const formatted = verifiedContent.error.format();
      const contentErrors = formatted?.content?._errors ?? [];
      const usernameErrors = formatted?.username?._errors ?? [];

      return NextResponse.json(
        {
          success: false,
          message:
            contentErrors[0] ?? usernameErrors[0] ?? "Invalid message data",
        },
        { status: 400 },
      );
    }

    const recipient = await userModel.findOne({ username, isVerified: true });
    if (!recipient) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Check if user is accepting messages
    if (!recipient.isAcceptingMessage) {
      return NextResponse.json(
        { success: false, message: "User is not accepting messages" },
        { status: 403 },
      );
    }

    const newMessage = await messageModel.create({
      userId: recipient?._id,
      content: content,
    });

    return NextResponse.json(
      { success: true, message: "Message created Successfully", newMessage },
      { status: 201 },
    );
  } catch (error) {
    const messageError = error instanceof Error ? error : "Error";
    return NextResponse.json(
      { success: false, message: messageError },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  // if (!session || !user)
  //   return NextResponse.json(
  //     { message: "User not authenticated" },
  //     { status: 401 },
  //   );
  // if (!session.user.isVerified)
  //   return NextResponse.json({ message: "User not verified" }, { status: 401 });

  const { content, messageId } = await request.json();
  await dbConnect();
  try {
    const verifiedContent = messageSchema.safeParse(content);
    if (!verifiedContent.success) {
      const errors = verifiedContent.error.format()?.content?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message: errors.length > 0 ? errors : "Invalid errors",
        },
        { status: 500 },
      );
    }

    const userMessage = await messageModel.findById(messageId);

    if (!userMessage)
      return NextResponse.json(
        {
          success: false,
          message: "No message found",
        },
        { status: 400 },
      );

    if (userMessage?.userId.toString() !== user?._id) {
      return NextResponse.json(
        { success: true, message: "You are not the owner of the post" },
        { status: 400 },
      );
    }

    userMessage.content = content;
    userMessage.save({ validateBeforeSave: false });

    return NextResponse.json(
      { success: true, message: "Message updates successfully", userMessage },
      { status: 200 },
    );
  } catch (error) {
    const messageError = error instanceof Error ? error : "Error";
    return NextResponse.json(
      { success: false, message: messageError },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  // if (!session || !user)
  //   return NextResponse.json(
  //     { message: "User not authenticated" },
  //     { status: 401 },
  //   );
  // if (!session.user.isVerified)
  //   return NextResponse.json({ message: "User not verified" }, { status: 401 });

  //   const {messageId} = await request.json();
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const queryParameters = {
    messageId: searchParams.get("messageId"),
  };

  const result = messageIdSchema.safeParse(queryParameters);
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: result.error.format().messageId?._errors || "Invalid Error",
      },
      { status: 400 },
    );
  }
  try {
    const userMessage = await messageModel.findById(result.data);
    if (!userMessage)
      return NextResponse.json(
        {
          success: false,
          message: "No message found",
        },
        { status: 400 },
      );

    if (userMessage?.userId.toString() !== user?._id) {
      return NextResponse.json(
        { success: true, message: "You are not authorized to delete the post" },
        { status: 400 },
      );
    }
    await userMessage.deleteOne();

    return NextResponse.json(
      { success: true, message: "Message delete successfully", userMessage },
      { status: 200 },
    );
  } catch (error) {
    const messageError = error instanceof Error ? error : "Error";
    return NextResponse.json(
      { success: false, message: messageError },
      { status: 500 },
    );
  }
}

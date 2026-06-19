import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import userModel from "@/models/user.models";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: userNameValidation,
});

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 },
      );
    }

    const { username } = result.data;
    const user = await userModel.findOne({ username: username });
    if (user)
      return NextResponse.json(
        { success: true, message: "username not avaialble" },
        { status: 200 },
      );
    return NextResponse.json(
      { success: true, message: "username is unique" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error checking username::", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 },
    );
  }
}

import { resend } from "@/lib/resend";
import VerificationEmailTemplate from "@/components/VerificationEmailTemplate";
import { APIResponse } from "@/types/APIResponse";

const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string,
): Promise<APIResponse> => {
  try {
    await resend.emails.send({
      from: "Hardik <onboarding@resend.dev>",
      to: email,
      subject: "Verification Email from mystery Message",
      react: VerificationEmailTemplate({ username: username, otp: verifyCode }),
    });
    return { success: true, message: "Verification email send successfully" };
  } catch (emailError) {
    console.log(`Error while sending message:: ${emailError} `);
    return { success: false, message: "Fail to send email" };
  }
};

export default sendVerificationEmail;

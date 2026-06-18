import config from "@/lib/config";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.models";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const VERIFICATION_CODE_EXPIRY_IN_MS = 60*60*1000
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        identifier: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "text" },
      },

      async authorize(credentials?: Record<"identifier" | "password", string>) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing Identifier or Password");
        }

        await dbConnect();

        const user = await userModel.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier },
          ],
        });
        if (!user) throw new Error("No user with email and username exists");
        if (!user.isVerified){
          user.verifyCodeExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_IN_MS)
          await user.save({validateBeforeSave:false})
        }

        const isValidPassword: boolean = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValidPassword) throw new Error("Credentials are not valid");

        // return the full user object shape expected by NextAuth (including isVerified)
        return {
          id: user._id.toString(),
          email: user.email,
          isVerified: user.isVerified,
          username: user.username,
          isAcceptingMessage: user.isAcceptingMessage,
        };
      },
    }),

    CredentialsProvider({
      id:"otp-verify",
      name:"otp-verify",
      credentials:{
        email:{label:"email",type:"text"},
        otp:{label:"OTP",type:"text"},
      },
      
      // async authorize(credentials?: Record<"identifier" | "password", string>) {
      async authorize(credentials) {
        if(!credentials?.email || !credentials?.otp){
        throw new Error("All the fields are required")
      }

      await dbConnect()

      const user = await userModel.findOne({email:credentials.email})
       
        if (!user) throw new Error("No user with email exists");
        
         if (!user.isVerified) throw new Error("Please verify your email by sign-up before login");
        if(user.verifyCode !== credentials.otp) throw new Error("Credentials are not valid");
       
        return {
          id: user._id.toString(),
          email: user.email,
          isVerified: user.isVerified,
          username: user.username,
          isAcceptingMessage: user.isAcceptingMessage,
        }
      }
        
    })
  ],
  callbacks: {
    async jwt({ user, token }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user._id = token.id as string;
        session.user.isVerified = token.isVerified;
        session.user.username = token.username;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: config.NEXTAUTH_SECRET,
};
export default authOptions;

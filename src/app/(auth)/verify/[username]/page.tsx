"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APIResponse } from "@/types/APIResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useState } from "react";
export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const[username,setUsername]=useState(params.username)
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      username:username,
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post(`/api/verify-code`, {
        username: username,
        code: data.code,
      });
      console.log("Response:: ",response)
      if (response.data.success) {
      const user = response?.data?.user
        toast("Success", {
          description: response.data.message,
        });
      await signIn("otp-verify", {
          email:user.email,
          otp:user.verifyCode,
          redirect: true,
          callbackUrl: "/dashboard",
        });
        // router.replace("/sign-in");
      } else {
        toast("Failed", {
          description: response.data.message,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast("Verification Failed", {
        description:
          axiosError.response?.data.message ??
          "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="username"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    setUsername(e.target.value);
                  }}
                />
              </Field>
            )}
          />
          <Controller
            name="code"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Verification Code</FieldLabel>
                <Input {...field} />
              </Field>
            )}
          />
          <Button type="submit">Verify</Button>
        </form>
      </div>
    </div>
  );
}

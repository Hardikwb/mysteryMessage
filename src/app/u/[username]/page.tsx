"use client"
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Controller, useForm } from 'react-hook-form'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Button } from '@/components/ui/button'
import axios from 'axios'
import { messageSchema } from '@/schemas/messageSchema'
import * as z from "zod"
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'

const MessagePage = () => {
    const params = useParams()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [messageOptions, setmessageOptions] = useState([])

    const form = useForm<z.infer<typeof messageSchema>>({
      resolver: zodResolver(messageSchema),
      defaultValues:{
        username: params.username as string,
        content:"",
      }
    })

    const {control, setValue} = form

  const onSubmit=async(data:z.infer<typeof messageSchema>):Promise<void>=>{
    setIsSubmitting(true)
    try {
      console.log("Submitting data:", data)
      const response = await axios.post("/api/messages",data)
      
      if (!response.data.success) {
        toast("Failed", {
          description: response.data.message,
        });
        setIsSubmitting(false)
        return;
      }
      toast("Success", {
        description: response.data.message,
      });
      form.reset({
        username: params.username as string,
        content: "",
      });
    } 
    catch (error) {
      console.error("Error caught:", error)
      let errorMessage = "Unknown error";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || "Failed to send message";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.log("Showing toast with error:", errorMessage)
      toast("Failed", {
        description: errorMessage,
      });
    }
    finally {
      setIsSubmitting(false)
      setmessageOptions([])
    }
  }

  const suggestMessage = async () => {
    try {
      const response = await axios.get(`/api/suggest-message?username=${params.username}`)
      console.log("options::",response.data.split("||"))
      setmessageOptions(response.data.split("||"))
      toast("Success", {
        description: "Message suggestion generated",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get suggestion";
      toast("Failed", {
        description: errorMessage,
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
            Send a Message
          </h1>
          <p className="text-xl text-slate-600">
            Share your thoughts anonymously with{' '}
            <span className="font-bold text-indigo-600">@{params.username}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }: any) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title" className="block text-sm font-semibold text-slate-900 mb-3">
                      Your Message
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="What's on your mind?"
                      autoComplete="off"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </Button>
              <Button
                type="button"
                onClick={suggestMessage}
                className="sm:flex-1 bg-white hover:bg-indigo-50 text-indigo-600 font-semibold py-3 px-6 rounded-lg border-2 border-indigo-600 transition-all transform hover:scale-105 active:scale-95"
              >
                ✨ Get Suggestions
              </Button>
            </div>
          </form>

          {/* Suggestions Section */}
          {messageOptions && messageOptions.length > 0 && (
            <div className="mt-8 pt-8 border-t-2 border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>💡</span> Suggested Messages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {messageOptions.map((message: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setValue('content', message)}
                    className="p-4 text-left rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95 bg-slate-50 hover:shadow-md"
                  >
                    <p className="text-slate-700 text-sm font-medium line-clamp-2">{message}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            💙 Be kind and respectful. Your message will be completely anonymous.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessagePage
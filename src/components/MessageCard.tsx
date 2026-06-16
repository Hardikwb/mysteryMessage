"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Message } from "@/models/message.models";
import dayjs from "dayjs"
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};


export async function MessageCard({ message, onMessageDelete }: MessageCardProps) {
    const handleDeleteConfirm = async() =>{
        try {
            const response = await axios.delete(`/api/messages?messageId=${message._id}`)
            if(!response.data.success){
                toast("Failed",{
                    description:response.data.message
                })
            }
            toast("Success",{
                description:response.data.message
            })
        } catch (error) {
            const errorMessage = error instanceof Error?error.message:"Unknow error"
            toast("Success",{
                description:errorMessage
            })
        }
    }

    return (
    <div>
    <Card size="sm" className="mx-auto w-full max-w-sm">
        <CardTitle>
          {message.content}
        </CardTitle>
        <CardDescription>
        </CardDescription>
        
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        
         <div className="text-sm">
          { dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
        </div>
    </Card>
    </div>
  )
}

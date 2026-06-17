"use client"
import { MessageCard } from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Message } from '@/models/message.models'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import { APIResponse } from '@/types/APIResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { Separator } from "@/components/ui/separator"
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

const Dashboard = () => {
  const [messages,setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setisLoadingMessages] = useState(false)
  const[isLoading,setisLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDeleteMessage = (messageId:string) =>{
    setMessages(messages.filter((message:Message) => message?._id.toString() !== messageId))
  }

  const {data:session} = useSession()

  const form = useForm({
    resolver:zodResolver(acceptMessageSchema),
  })

  const { register, watch, setValue } = form;
  const isAccepting = watch('isAccepting');

  const fetchAcceptMessages = useCallback(async()=>{
      setisLoadingMessages(true)
      try {
        const response = await axios.get('/api/accept-messages') 
        setValue('isAccepting', response.data.isAcceptingMessages); 
      } 
      catch (error) {
        const axiosError = error as AxiosError<APIResponse>;
      toast('Error',{
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
      })}
      finally{
        setisLoadingMessages(false)
      }
  },[setValue,setisLoadingMessages])

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setisLoading(true);
      setisLoadingMessages(false);
      try {
        const response = await axios.get<APIResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast('Refreshed Messages',{
            description: 'Showing latest messages',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<APIResponse>;
        toast('Error',{
          description:
          axiosError.response?.data.message ?? 'Failed to fetch messages',
        });
      } 
      finally {
        setisLoading(false);
        setisLoadingMessages(true);
      }
    },
    [setisLoadingMessages, setMessages]);


  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();

    fetchAcceptMessages();
  }, [session, setValue, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async()=>{
     setIsToggling(true)
     try {
      const response = await axios.post<APIResponse>('/api/accept-messages', {
        acceptMessage: !isAccepting,
      });
      if (!response.data.success) {
        toast('Failed', {
          description: response.data.message ?? 'Failed to update message settings',
        });
        setIsToggling(false)
        return;
      }
      setValue('isAccepting', !isAccepting);
      toast('Success', {
        description: response.data.message,
      });
    } 
    
    catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast('Error',{
        description:
          axiosError.response?.data.message ??
          'Failed to update message settings',
      });
    }
    finally {
      setIsToggling(false)
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session.user as User;
  const baseURL = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseURL}/u/${username}`

  const CopyToClipboard = ()=>{
    navigator.clipboard.writeText(profileUrl)
    toast('URL Copied!',{
      description: 'Profile URL has been copied to clipboard.',
    });
  }



   return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={CopyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('isAccepting')}
          data-checked={isAccepting}
          onCheckedChange={handleSwitchChange}
          disabled={isToggling}
        />
        <span className="ml-2">
          Accept Messages: {isAccepting ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id.toString()}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard
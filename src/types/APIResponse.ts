import { Message } from "@/models/message.models";

export interface APIResponse {
  success: boolean;
  message: string;
  isAcceptingMessage?: boolean;
  messages?: Array<Message>;
}

<template>
  <div class="space-y-4">
    <div
      v-for="message in messages"
      :key="message.id"
      :class="[
        'flex',
        message.senderId === currentUserId ? 'justify-end' : 'justify-start',
      ]"
    >
      <div
        :class="[
          'max-w-xs lg:max-w-md xl:max-w-lg group',
          message.senderId === currentUserId ? 'order-2' : 'order-1',
        ]"
      >
        <!-- Message Bubble -->
        <div
          :class="[
            'rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 group-hover:shadow-md',
            message.senderId === currentUserId
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-md',
            message.pending ? 'opacity-70' : '',
          ]"
        >
          <p class="text-sm leading-relaxed break-words">
            {{ message.message }}
          </p>

          <!-- Message Status -->
          <div
            :class="[
              'flex items-center justify-between mt-2 text-xs',
              message.senderId === currentUserId
                ? 'text-blue-100'
                : 'text-slate-500 dark:text-slate-400',
            ]"
          >
            <span>{{ formatMessageTime(message.createdAt) }}</span>

            <div
              v-if="message.senderId === currentUserId"
              class="flex items-center space-x-1"
            >
              <!-- Sending -->
              <Clock v-if="message.status === 'sending'" class="w-3 h-3" />
              <!-- Sent -->
              <Check v-else-if="message.status === 'sent'" class="w-3 h-3" />
              <!-- Delivered -->
              <CheckCheck
                v-else-if="message.status === 'delivered'"
                class="w-3 h-3"
              />
              <!-- Read -->
              <CheckCheck
                v-else-if="message.read || message.status === 'read'"
                class="w-3 h-3 text-blue-200"
              />
            </div>
          </div>
        </div>

        <!-- Avatar for received messages -->
        <div
          v-if="message.senderId !== currentUserId"
          class="flex items-end space-x-2 mt-2"
        >
          <Avatar class="w-6 h-6">
            <AvatarFallback class="bg-slate-500 text-white text-xs">
              {{ message.senderId.charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="messages.length === 0" class="text-center py-12">
      <div class="mb-4">
        <MessageSquare
          class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto"
        />
      </div>
      <p class="text-slate-500 dark:text-slate-400">
        No messages yet. Start the conversation!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated } from "vue";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Check, CheckCheck, MessageSquare } from "lucide-vue-next";

interface Message {
  id: string;
  errandId: string;
  senderId: string;
  recipientId: string;
  message: string;
  read: boolean;
  createdAt: string;
  status?: "sending" | "sent" | "delivered" | "read";
  pending?: boolean;
}

defineProps<{
  messages: Message[];
  currentUserId: string;
}>();

defineEmits<{
  messageRead: [messageId: string];
}>();

const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m ago`;
  } else if (diffInMinutes < 1440) {
    // 24 hours
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};
</script>

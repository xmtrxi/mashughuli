<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import type { ApiResponse } from "~/types";
import { toast } from "vue-sonner";

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  errandId: string;
  message: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  errandId: string;
  errandTitle: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

// Composables
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const conversations = ref<Conversation[]>([]);
const messages = ref<Message[]>([]);
const activeConversationId = ref<string | null>(null);
const isLoadingConversations = ref(true);
const isLoadingMessages = ref(false);
const isUserTyping = ref(false);
const ws = ref<WebSocket | null>(null);

const currentUserId = computed(() => authStore.user?.id);
const activeConversation = computed(() =>
  conversations.value.find((c) => c.id === activeConversationId.value),
);
const messagesContainer = ref<HTMLElement | null>(null);

// WebSocket Logic
function connectWebSocket() {
  const wsUrl = `ws://${window.location.host}/api/websocket`;
  ws.value = new WebSocket(wsUrl);

  ws.value.onopen = () => {
    console.log("WebSocket connected");
    if (currentUserId.value) {
      ws.value?.send(
        JSON.stringify({ type: "auth", userId: currentUserId.value }),
      );
    }
  };

  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "history":
        if (data.conversationId === activeConversationId.value) {
          messages.value = data.messages;
          scrollToBottom();
        }
        break;
      case "message":
        const convId = getConversationId(
          data.message.senderId,
          data.message.recipientId,
          data.message.errandId,
        );

        // Update conversation list
        const convIndex = conversations.value.findIndex((c) => c.id === convId);
        if (convIndex > -1) {
          conversations.value[convIndex].lastMessage = data.message.message;
          conversations.value[convIndex].timestamp = data.message.createdAt;
          if (
            data.message.senderId !== currentUserId.value &&
            convId !== activeConversationId.value
          ) {
            conversations.value[convIndex].unread++;
          }
          // Move updated conversation to the top
          const updatedConv = conversations.value.splice(convIndex, 1)[0];
          conversations.value.unshift(updatedConv);
        }

        // Add to active chat
        if (convId === activeConversationId.value) {
          messages.value.push(data.message);
          scrollToBottom();
        }
        break;
      case "typing":
        if (
          data.userId !== currentUserId.value &&
          data.conversationId === activeConversationId.value
        ) {
          isUserTyping.value = true;
          setTimeout(() => (isUserTyping.value = false), 3000); // Typing indicator timeout
        }
        break;
    }
  };

  ws.value.onclose = () => {
    console.log("WebSocket disconnected. Reconnecting...");
    setTimeout(connectWebSocket, 5000);
  };
}

// Data Fetching
async function fetchConversations() {
  isLoadingConversations.value = true;
  try {
    const response = await useApiFetch<{ conversations: Conversation[] }>(
      "/api/conversations",
    );
    if (response.data.value?.conversations) {
      conversations.value = response.data.value.conversations;
    }
  } catch (e) {
    toast.error("Failed to load conversations.");
  } finally {
    isLoadingConversations.value = false;
  }
}

async function selectConversation(conversationId: string) {
  if (activeConversationId.value === conversationId) return;

  activeConversationId.value = conversationId;
  if (route.params.id !== conversationId) {
    router.push(`/dashboard/messages/${conversationId}`);
  }

  isLoadingMessages.value = true;
  messages.value = [];

  const conversation = conversations.value.find((c) => c.id === conversationId);
  if (conversation && ws.value?.readyState === WebSocket.OPEN) {
    ws.value.send(
      JSON.stringify({
        type: "join",
        errandId: conversation.errandId,
        otherUserId: conversation.otherUserId,
      }),
    );
    conversation.unread = 0; // Optimistically mark as read
  } else if (ws.value?.readyState !== WebSocket.OPEN) {
    // If WS is not open, fetch history via HTTP as a fallback
    // This is a good practice for initial load.
    await fetchHistory(conversationId);
  }

  isLoadingMessages.value = false;
}

async function fetchHistory(conversationId: string) {
  const conversation = conversations.value.find((c) => c.id === conversationId);
  if (!conversation) return;
  try {
    const { data } = await useApiFetch<{ messages: Message[] }>(
      `/api/messages?errandId=${conversation.errandId}&otherUserId=${conversation.otherUserId}`,
    );
    if (data.value?.messages) {
      messages.value = data.value.messages;
      scrollToBottom();
    }
  } catch (e) {
    toast.error("Failed to load message history.");
  }
}

const handleSendMessage = (messageText: string) => {
  if (
    !ws.value ||
    ws.value.readyState !== WebSocket.OPEN ||
    !activeConversation.value ||
    !currentUserId.value
  )
    return;
  const conversation = activeConversation.value;
  if (!conversation) return;

  ws.value.send(
    JSON.stringify({
      type: "send",
      errandId: conversation.errandId,
      recipientId: conversation.otherUserId,
      message: messageText,
    }),
  );
};

const handleTyping = () => {
  if (ws.value && activeConversationId.value) {
    ws.value.send(
      JSON.stringify({
        type: "typing",
        conversationId: activeConversationId.value,
      }),
    );
  }
};

// Utility
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";
const getConversationId = (
  userId1: string,
  userId2: string,
  errandId: string,
) => {
  const sortedIds = [userId1, userId2].sort();
  return `${errandId}:${sortedIds[0]}:${sortedIds[1]}`;
};

// Lifecycle & Watchers
onMounted(async () => {
  await fetchConversations();
  connectWebSocket();
  const routeId = route.params.id as string | undefined;
  if (routeId) {
    // Ensure the conversation exists before selecting it
    const conversationExists = conversations.value.some(
      (c) => c.id === routeId,
    );
    if (conversationExists) {
      await selectConversation(routeId);
    } else if (conversations.value.length > 0) {
      await selectConversation(conversations.value[0].id);
    }
  } else if (conversations.value.length > 0) {
    await selectConversation(conversations.value[0].id);
  }
});

onUnmounted(() => {
  ws.value?.close();
});

watch(currentUserId, (newVal) => {
  if (newVal && ws.value?.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({ type: "auth", userId: newVal }));
  }
});

watch(
  () => route.params.id,
  (newId) => {
    const conversationId = Array.isArray(newId) ? newId[0] : newId;
    if (conversationId && conversationId !== activeConversationId.value) {
      selectConversation(conversationId);
    }
  },
);
</script>
<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 grid grid-cols-12 min-h-0">
      <!-- Conversation List Sidebar -->
      <aside
        class="col-span-12 lg:col-span-4 xl:col-span-3 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col"
      >
        <div class="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-bold">Messages</h2>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div v-if="isLoadingConversations" class="p-4 space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3">
              <Skeleton class="w-12 h-12 rounded-full" />
              <div class="space-y-2 flex-1">
                <Skeleton class="h-4 w-3/4" />
                <Skeleton class="h-4 w-1/2" />
              </div>
            </div>
          </div>
          <div v-else class="p-2 space-y-1">
            <button
              v-for="conv in conversations"
              :key="conv.id"
              @click="selectConversation(conv.id)"
              :class="[
                'w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3',
                activeConversationId === conv.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
              ]"
            >
              <div class="relative">
                <Avatar>
                  <AvatarImage
                    :src="conv.otherUserAvatar"
                    :alt="conv.otherUserName"
                  />
                  <AvatarFallback>{{
                    getInitials(conv.otherUserName)
                  }}</AvatarFallback>
                </Avatar>
                <div
                  v-if="conv.unread > 0"
                  class="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {{ conv.unread }}
                </div>
              </div>
              <div class="flex-1 overflow-hidden">
                <div class="flex justify-between items-baseline">
                  <p class="font-semibold truncate">{{ conv.otherUserName }}</p>
                  <p class="text-xs text-muted-foreground flex-shrink-0">
                    {{
                      new Date(conv.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}
                  </p>
                </div>
                <p class="text-sm text-muted-foreground truncate">
                  {{ conv.lastMessage }}
                </p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- Message Area -->
      <main
        class="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col bg-white dark:bg-slate-900"
      >
        <div
          v-if="!activeConversation"
          class="flex-1 flex items-center justify-center text-center"
        >
          <div>
            <Icon
              name="mdi:message-text-outline"
              class="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4"
            />
            <h3
              class="text-xl font-semibold text-slate-600 dark:text-slate-300"
            >
              Select a conversation
            </h3>
            <p class="text-muted-foreground">
              Choose a conversation to start messaging.
            </p>
          </div>
        </div>
        <template v-else>
          <!-- Chat Header -->
          <header
            class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"
          >
            <div v-if="activeConversation" class="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  :src="activeConversation.otherUserAvatar"
                  :alt="activeConversation.otherUserName"
                />
                <AvatarFallback>{{
                  getInitials(activeConversation.otherUserName)
                }}</AvatarFallback>
              </Avatar>
              <div>
                <h3 class="font-semibold">
                  {{ activeConversation.otherUserName }}
                </h3>
                <p class="text-sm text-muted-foreground truncate">
                  Re: {{ activeConversation.errandTitle }}
                </p>
              </div>
            </div>
            <div
              v-if="isUserTyping"
              class="text-sm text-muted-foreground animate-pulse"
            >
              Typing...
            </div>
          </header>

          <!-- Messages -->
          <div
            ref="messagesContainer"
            class="flex-1 p-6 overflow-y-auto space-y-4"
          >
            <div
              v-if="isLoadingMessages"
              class="flex justify-center items-center h-full"
            >
              <Icon name="mdi:loading" class="w-8 h-8 animate-spin" />
            </div>
            <div
              v-else
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex',
                message.senderId === currentUserId
                  ? 'justify-end'
                  : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'p-3 rounded-2xl max-w-lg',
                  message.senderId === currentUserId
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted text-muted-foreground rounded-bl-none',
                ]"
              >
                <p>{{ message.message }}</p>
                <p class="text-xs opacity-70 mt-1 text-right">
                  {{
                    new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div
            class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
          >
            <MessagingMessageInput
              @send-message="handleSendMessage"
              @typing="handleTyping"
            />
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
<style scoped>
/* Custom scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Dark mode scrollbar */
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.3);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.5);
}

/* Animation for message status indicators */
@keyframes messageStatusPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.message-sending {
  animation: messageStatusPulse 1s infinite;
}

/* Smooth transitions for conversation selection */
.conversation-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.conversation-item:hover {
  transform: translateX(2px);
}

/* Message bubble animations */
.message-bubble {
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Typing indicator animation */
.typing-dot {
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingBounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Glassmorphism effect enhancement */
.glass-effect {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass-effect {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
}

/* Enhanced gradient backgrounds */
.gradient-bg {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 50%,
    rgba(219, 39, 119, 0.1) 100%
  );
}

/* Status indicator animations */
.status-online {
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* Bid status badge animations */
.bid-status-badge {
  transition: all 0.2s ease;
}

.bid-status-badge:hover {
  transform: scale(1.05);
}

/* Message input enhancements */
.message-input-container {
  position: relative;
  overflow: hidden;
}

.message-input-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 130, 246, 0.3),
    transparent
  );
}

/* Responsive design enhancements */
@media (max-width: 1024px) {
  .conversation-sidebar {
    position: absolute;
    left: -100%;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
    transition: left 0.3s ease;
  }

  .conversation-sidebar.open {
    left: 0;
  }

  .messages-area {
    width: 100%;
  }
}

/* Focus states for accessibility */
.conversation-item:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(
    90deg,
    rgba(226, 232, 240, 0.3) 25%,
    rgba(226, 232, 240, 0.5) 50%,
    rgba(226, 232, 240, 0.3) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.dark .loading-shimmer {
  background: linear-gradient(
    90deg,
    rgba(71, 85, 105, 0.3) 25%,
    rgba(71, 85, 105, 0.5) 50%,
    rgba(71, 85, 105, 0.3) 75%
  );
  background-size: 200% 100%;
}
</style>

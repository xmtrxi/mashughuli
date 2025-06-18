<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import type { ApiResponse } from "~/types";
import { toast } from "vue-sonner";

// --- TYPE DEFINITIONS ---
interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
  status: "sent" | "delivered" | "read";
  sender: {
    avatarUrl: string | null;
  };
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

// --- COMPOSABLES & STATE ---
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

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
let typingTimeout: NodeJS.Timeout | null = null;

// --- WEBSOCKET LOGIC ---
function connectWebSocket() {
  if (
    ws.value &&
    (ws.value.readyState === WebSocket.OPEN ||
      ws.value.readyState === WebSocket.CONNECTING)
  )
    return;

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
      case "message":
        handleNewMessage(data.message);
        break;
      case "typing":
        handleTypingIndicator(data);
        break;
      case "messages_read":
        handleMessagesRead(data);
        break;
    }
  };

  ws.value.onclose = () => {
    console.log("WebSocket disconnected. Reconnecting...");
    setTimeout(connectWebSocket, 5000);
  };
}

function handleNewMessage(message: Message) {
  const convId = getConversationId(
    message.senderId,
    message.recipientId,
    message.errandId,
  );

  const convIndex = conversations.value.findIndex((c) => c.id === convId);
  if (convIndex > -1) {
    const conversation = conversations.value[convIndex];
    conversation.lastMessage = message.message;
    conversation.timestamp = message.createdAt;
    if (
      message.senderId !== currentUserId.value &&
      convId !== activeConversationId.value
    ) {
      conversation.unread++;
    }
    const [updatedConv] = conversations.value.splice(convIndex, 1);
    conversations.value.unshift(updatedConv);
  } else {
    // If conversation is brand new, refresh the list to get it
    fetchConversations();
  }

  if (convId === activeConversationId.value) {
    messages.value.push(message);
    scrollToBottom();
  }
}

function handleTypingIndicator(data: {
  userId: string;
  conversationId: string;
}) {
  if (
    data.userId !== currentUserId.value &&
    data.conversationId === activeConversationId.value
  ) {
    isUserTyping.value = true;
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      isUserTyping.value = false;
    }, 3000);
  }
}

function handleMessagesRead(data: { conversationId: string }) {
  if (data.conversationId === activeConversationId.value) {
    messages.value.forEach((msg) => {
      if (msg.senderId === currentUserId.value) {
        msg.status = "read";
      }
    });
  }
}

// --- DATA FETCHING & STATE MANAGEMENT ---
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
  if (
    activeConversationId.value === conversationId &&
    messages.value.length > 0
  )
    return;

  activeConversationId.value = conversationId;
  const currentPath = `/dashboard/messages/${conversationId}`;
  if (route.fullPath !== currentPath) {
    await router.push(currentPath);
  }

  isLoadingMessages.value = true;
  messages.value = [];

  const conversation = conversations.value.find((c) => c.id === conversationId);
  if (conversation) {
    await fetchHistory(conversation.otherUserId);
    conversation.unread = 0;
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(
        JSON.stringify({ type: "join", otherUserId: conversation.otherUserId }),
      );
    }
  }

  isLoadingMessages.value = false;
}

async function fetchHistory(otherUserId: string) {
  try {
    const { data } = await useApiFetch<{ messages: Message[] }>(
      `/api/messages?otherUserId=${otherUserId}`,
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
  console.log("Test");
  const conversation = activeConversation.value;
  console.log(conversation);
  if (!conversation) return;
  console.log("Sending");

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
  if (ws.value && activeConversation.value) {
    ws.value.send(
      JSON.stringify({
        type: "typing",
        conversationId: activeConversation.value.id,
        recipientId: activeConversation.value.otherUserId,
      }),
    );
  }
};

// --- UTILITIES & LIFECYCLE ---
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

onMounted(async () => {
  connectWebSocket();
  await fetchConversations();

  const { new: isNew, errandId, recipientId } = route.query;
  const routeIdFromParam = route.params.id as string | undefined;

  let targetConvId: string | null = null;

  if (isNew && errandId && recipientId && currentUserId.value) {
    targetConvId = getConversationId(
      currentUserId.value,
      recipientId as string,
      errandId as string,
    );
  } else if (routeIdFromParam) {
    targetConvId = routeIdFromParam;
  } else if (conversations.value.length > 0) {
    targetConvId = conversations.value[0].id;
  }

  if (targetConvId) {
    if (conversations.value.some((c) => c.id === targetConvId)) {
      await selectConversation(targetConvId);
    } else {
      // If starting a new chat that's not in the list, refresh and select
      await fetchConversations();
      if (conversations.value.some((c) => c.id === targetConvId)) {
        await selectConversation(targetConvId);
      }
    }
  }
});

onUnmounted(() => {
  ws.value?.close();
  if (typingTimeout) clearTimeout(typingTimeout);
});

watch(currentUserId, (newVal) => {
  if (newVal && ws.value?.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({ type: "auth", userId: newVal }));
  }
});
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
                  ? 'bg-primary/10'
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
                  <p
                    :class="[
                      'font-semibold truncate',
                      { 'text-primary': activeConversationId === conv.id },
                    ]"
                  >
                    {{ conv.otherUserName }}
                  </p>
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
            class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0"
          >
            <div class="flex items-center gap-3">
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
                <p
                  v-if="activeConversation.errandId !== SUPPORT_ERRAND_ID"
                  class="text-sm text-muted-foreground truncate"
                >
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
              <div class="flex items-end gap-2 max-w-lg">
                <Avatar
                  v-if="message.senderId !== currentUserId"
                  class="w-8 h-8 self-end mb-2"
                >
                  <AvatarImage :src="message.sender.avatarUrl" />
                  <AvatarFallback>{{
                    getInitials(activeConversation.otherUserName)
                  }}</AvatarFallback>
                </Avatar>
                <div
                  :class="[
                    'p-3 rounded-2xl',
                    message.senderId === currentUserId
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none',
                  ]"
                >
                  <p class="whitespace-pre-wrap">{{ message.message }}</p>
                  <div
                    class="flex items-center gap-2 mt-1"
                    :class="[
                      message.senderId === currentUserId
                        ? 'justify-end'
                        : 'justify-start',
                    ]"
                  >
                    <p class="text-xs opacity-70">
                      {{
                        new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }}
                    </p>
                    <Icon
                      v-if="
                        message.senderId === currentUserId &&
                        message.status === 'read'
                      "
                      name="mdi:check-all"
                      class="h-4 w-4 text-blue-400"
                    />
                    <Icon
                      v-if="
                        message.senderId === currentUserId &&
                        message.status === 'sent'
                      "
                      name="mdi:check"
                      class="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div
            class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0"
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

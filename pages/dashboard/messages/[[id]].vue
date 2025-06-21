<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import type { ApiResponse } from "~/types";
import { toast } from "vue-sonner";

// --- TYPE DEFINITIONS ---
interface Message {
  id: string;
  senderId: string;
  recipientId?: string; // ADDED: Add recipientId to message interface
  errandId?: string; // ADDED: Add errandId to message interface
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
const isSidebarOpen = ref(false); // ADDED: Mobile sidebar state

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

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/websocket`;
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

  // ADDED: Close mobile sidebar when conversation is selected
  isSidebarOpen.value = false;

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

// ENHANCED: Fixed message sending with optimistic updates
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

  // ADDED: Create optimistic message
  const optimisticMessage: Message = {
    id: `temp-${Date.now()}`,
    senderId: currentUserId.value,
    recipientId: conversation.otherUserId,
    errandId: conversation.errandId,
    message: messageText,
    createdAt: new Date().toISOString(),
    status: "sent",
    sender: {
      avatarUrl: authStore.user?.avatarUrl || null,
    },
  };

  // ADDED: Add optimistic message to UI immediately
  messages.value.push(optimisticMessage);
  scrollToBottom();

  // ADDED: Update conversation list optimistically
  const convIndex = conversations.value.findIndex(
    (c) => c.id === conversation.id,
  );
  if (convIndex > -1) {
    const conv = conversations.value[convIndex];
    conv.lastMessage = messageText;
    conv.timestamp = new Date().toISOString();
    const [updatedConv] = conversations.value.splice(convIndex, 1);
    conversations.value.unshift(updatedConv);
  }

  console.log("Sending message:", messageText);

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

// ADDED: Toggle mobile sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
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

// ADDED: Format relative time
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMs = now.getTime() - messageTime.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    return messageTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInDays < 1) {
    return messageTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInDays < 7) {
    return messageTime.toLocaleDateString([], { weekday: "short" });
  } else {
    return messageTime.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }
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

// ADDED: Close sidebar when clicking outside on mobile
const handleClickOutside = (event: Event) => {
  const sidebar = document.querySelector(".conversation-sidebar");
  if (
    sidebar &&
    !sidebar.contains(event.target as Node) &&
    isSidebarOpen.value
  ) {
    isSidebarOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    class="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800 overflow-hidden"
  >
    <!-- Mobile header with hamburger menu -->
    <div
      class="lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 p-4 flex items-center justify-between sticky top-0 z-50 flex-shrink-0"
    >
      <button
        @click="toggleSidebar"
        class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
      >
        <Icon name="mdi:menu" class="w-6 h-6" />
      </button>
      <h1
        class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
      >
        Messages
      </h1>
      <div class="w-10 h-10"></div>
    </div>

    <!-- Main container with fixed height -->
    <div class="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
      <!-- Conversation List Sidebar -->
      <aside
        :class="[
          'col-span-12 lg:col-span-4 xl:col-span-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
          'lg:relative lg:translate-x-0',
          isSidebarOpen
            ? 'fixed inset-y-0 left-0 z-40 w-full sm:w-96 translate-x-0 shadow-2xl'
            : 'fixed inset-y-0 left-0 z-40 w-full sm:w-96 -translate-x-full lg:translate-x-0',
        ]"
      >
        <!-- Sidebar header - Fixed -->
        <div
          class="p-4 sm:p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-800/50 dark:to-slate-700/50 flex-shrink-0"
        >
          <div class="flex items-center justify-between">
            <h2
              class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Messages
            </h2>
            <button
              @click="toggleSidebar"
              class="lg:hidden p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-sm"
            >
              <Icon name="mdi:close" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Conversation list - Scrollable -->
        <div class="flex-1 overflow-y-auto scrollbar-thin">
          <div v-if="isLoadingConversations" class="p-4 space-y-3">
            <div
              v-for="i in 6"
              :key="i"
              class="flex items-center gap-4 p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 animate-pulse"
            >
              <div
                class="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
              ></div>
              <div class="space-y-3 flex-1">
                <div
                  class="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg w-3/4"
                ></div>
                <div
                  class="h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg w-1/2"
                ></div>
              </div>
            </div>
          </div>

          <div v-else-if="conversations.length === 0" class="p-8 text-center">
            <Icon
              name="mdi:message-text-outline"
              class="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4"
            />
            <p class="text-slate-600 dark:text-slate-400 font-medium">
              No conversations yet
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Start a new conversation to get chatting!
            </p>
          </div>

          <div v-else class="p-3 space-y-2">
            <button
              v-for="conv in conversations"
              :key="conv.id"
              @click="selectConversation(conv.id)"
              :class="[
                'w-full text-left p-3 sm:p-4 rounded-2xl transition-all duration-200 flex items-center gap-3 sm:gap-4 group relative overflow-hidden',
                activeConversationId === conv.id
                  ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 shadow-lg border border-blue-200/50 dark:border-blue-500/30 transform scale-[1.02]'
                  : 'hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:transform hover:scale-[1.01] bg-white/30 dark:bg-slate-800/30',
              ]"
            >
              <div
                class="relative flex items-center gap-3 sm:gap-4 w-full min-w-0"
              >
                <div class="relative flex-shrink-0">
                  <Avatar
                    class="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-white/50 dark:ring-slate-700/50 shadow-md"
                  >
                    <AvatarImage
                      :src="conv.otherUserAvatar"
                      :alt="conv.otherUserName"
                    />
                    <AvatarFallback
                      class="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold text-sm"
                    >
                      {{ getInitials(conv.otherUserName) }}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    v-if="conv.unread > 0"
                    class="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse"
                  >
                    {{ conv.unread > 99 ? "99+" : conv.unread }}
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-1">
                    <p
                      :class="[
                        'font-semibold truncate text-base sm:text-lg',
                        activeConversationId === conv.id
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-900 dark:text-slate-100',
                      ]"
                    >
                      {{ conv.otherUserName }}
                    </p>
                    <p
                      class="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2 font-medium"
                    >
                      {{ formatRelativeTime(conv.timestamp) }}
                    </p>
                  </div>
                  <p
                    class="text-sm text-slate-600 dark:text-slate-400 truncate leading-relaxed"
                  >
                    {{ conv.lastMessage }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- Message Area with proper flex layout -->
      <main
        class="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm min-h-0 overflow-hidden"
      >
        <!-- Empty state -->
        <div
          v-if="!activeConversation"
          class="flex-1 flex items-center justify-center text-center p-4 sm:p-8"
        >
          <div class="space-y-6 max-w-md">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
              ></div>
              <Icon
                name="mdi:message-text-outline"
                class="relative w-20 h-20 sm:w-24 sm:h-24 text-slate-300 dark:text-slate-600 mx-auto"
              />
            </div>
            <div class="space-y-3">
              <h3
                class="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300"
              >
                Select a conversation
              </h3>
              <p
                class="text-slate-500 dark:text-slate-400 leading-relaxed text-sm sm:text-base"
              >
                Choose a conversation from the sidebar to start messaging, or
                create a new one to get the conversation flowing.
              </p>
            </div>
          </div>
        </div>

        <template v-else>
          <!-- Chat Header - Fixed -->
          <header
            class="p-4 sm:p-6 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
          >
            <div class="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Avatar
                class="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-blue-200/50 dark:ring-blue-500/30 shadow-lg flex-shrink-0"
              >
                <AvatarImage
                  :src="activeConversation.otherUserAvatar"
                  :alt="activeConversation.otherUserName"
                />
                <AvatarFallback
                  class="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold"
                >
                  {{ getInitials(activeConversation.otherUserName) }}
                </AvatarFallback>
              </Avatar>
              <div class="space-y-1 min-w-0 flex-1">
                <h3
                  class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate"
                >
                  {{ activeConversation.otherUserName }}
                </h3>
                <p
                  v-if="activeConversation.errandId !== 'SUPPORT_ERRAND_ID'"
                  class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate"
                >
                  Re: {{ activeConversation.errandTitle }}
                </p>
              </div>
            </div>

            <!-- Typing indicator -->
            <div
              v-if="isUserTyping"
              class="flex items-center gap-2 text-blue-600 dark:text-blue-400 flex-shrink-0"
            >
              <div class="flex gap-1">
                <div
                  class="w-2 h-2 bg-current rounded-full animate-bounce"
                  style="animation-delay: 0ms"
                ></div>
                <div
                  class="w-2 h-2 bg-current rounded-full animate-bounce"
                  style="animation-delay: 150ms"
                ></div>
                <div
                  class="w-2 h-2 bg-current rounded-full animate-bounce"
                  style="animation-delay: 300ms"
                ></div>
              </div>
              <span class="text-sm font-medium hidden sm:inline"
                >Typing...</span
              >
            </div>
          </header>

          <!-- Messages Container - Scrollable Area -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-800/30"
            style="scroll-behavior: smooth"
          >
            <div
              v-if="isLoadingMessages"
              class="flex justify-center items-center h-full min-h-[200px]"
            >
              <div class="flex flex-col items-center gap-4">
                <div class="relative">
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl"
                  ></div>
                  <Icon
                    name="mdi:loading"
                    class="relative w-12 h-12 animate-spin text-blue-600 dark:text-blue-400"
                  />
                </div>
                <p class="text-slate-600 dark:text-slate-400 font-medium">
                  Loading messages...
                </p>
              </div>
            </div>

            <div
              v-else
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex animate-fadeInUp',
                message.senderId === currentUserId
                  ? 'justify-end'
                  : 'justify-start',
              ]"
            >
              <div
                class="flex items-end gap-2 sm:gap-3 max-w-[85%] sm:max-w-lg"
              >
                <Avatar
                  v-if="message.senderId !== currentUserId"
                  class="w-6 h-6 sm:w-8 sm:h-8 self-end mb-2 ring-2 ring-white/50 dark:ring-slate-700/50 shadow-sm flex-shrink-0"
                >
                  <AvatarImage :src="message.sender.avatarUrl" />
                  <AvatarFallback
                    class="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs font-semibold"
                  >
                    {{ getInitials(activeConversation.otherUserName) }}
                  </AvatarFallback>
                </Avatar>

                <div
                  :class="[
                    'p-3 sm:p-4 rounded-2xl shadow-lg backdrop-blur-sm relative group max-w-full',
                    message.senderId === currentUserId
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-md'
                      : 'bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-200/50 dark:border-slate-700/50',
                  ]"
                >
                  <p
                    class="whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words"
                  >
                    {{ message.message }}
                  </p>
                  <div
                    :class="[
                      'flex items-center gap-2 mt-2 text-xs',
                      message.senderId === currentUserId
                        ? 'justify-end text-blue-100'
                        : 'justify-start text-slate-500 dark:text-slate-400',
                    ]"
                  >
                    <span class="font-medium">
                      {{
                        new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }}
                    </span>
                    <Icon
                      v-if="
                        message.senderId === currentUserId &&
                        message.status === 'read'
                      "
                      name="mdi:check-all"
                      class="h-3 w-3 sm:h-4 sm:w-4 text-blue-200"
                    />
                    <Icon
                      v-else-if="
                        message.senderId === currentUserId &&
                        message.status === 'sent'
                      "
                      name="mdi:check"
                      class="h-3 w-3 sm:h-4 sm:w-4 text-blue-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input - Fixed at bottom -->
          <div
            class="p-4 sm:p-6 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex-shrink-0"
          >
            <MessagingMessageInput
              @send-message="handleSendMessage"
              @typing="handleTyping"
              class="message-input-enhanced w-full"
            />
          </div>
        </template>
      </main>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
      @click="toggleSidebar"
    />
  </div>
</template>

<style scoped>
/* Enhanced scrollbar styling */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.3),
    rgba(139, 92, 246, 0.3)
  );
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.5),
    rgba(139, 92, 246, 0.5)
  );
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: linear-gradient(
    135deg,
    rgba(71, 85, 105, 0.4),
    rgba(51, 65, 85, 0.4)
  );
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    135deg,
    rgba(71, 85, 105, 0.6),
    rgba(51, 65, 85, 0.6)
  );
}

/* Smooth animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.3s ease-out;
}

/* Message bubble hover effects */
.group:hover {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

/* Enhanced message input styling */
.message-input-enhanced {
  position: relative;
}

.message-input-enhanced::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 130, 246, 0.3),
    rgba(139, 92, 246, 0.3),
    transparent
  );
}

/* Smooth transitions */
* {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

/* Custom selection colors */
::selection {
  background: rgba(59, 130, 246, 0.2);
  color: inherit;
}

.dark ::selection {
  background: rgba(59, 130, 246, 0.3);
}

/* Improved button hover states */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Focus states for accessibility */
button:focus-visible,
input:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
  border-radius: 8px;
}

/* Responsive improvements */
@media (max-width: 640px) {
  .text-2xl {
    font-size: 1.5rem;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .text-lg {
    font-size: 1.125rem;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Ensure proper height constraints */
.h-screen {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
}

/* Prevent content overflow */
.min-h-0 {
  min-height: 0;
}

/* Enhanced glass morphism */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
</style>

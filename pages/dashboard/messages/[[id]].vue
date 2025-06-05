<!-- pages/messages/[id].vue -->
<script setup lang="ts">
import { MessagingMessageInput } from "#components";
import {
  MessageSquare,
  Loader2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-vue-next";
import { toast } from "vue-sonner";

// Types
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

interface Conversation {
  id: string;
  errandId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  errandTitle: string;
  bidAmount?: number;
  bidStatus?: "pending" | "accepted" | "rejected";
  userRole: "requester" | "bidder";
  conversationType: "bid_conversation" | "regular";
}

// Composables
const route = useRoute();
const router = useRouter();

// Reactive data
const activeConversation = ref<string | null>(
  (route.params.id as string) || null,
);
const conversations = ref<Conversation[]>([]);
const messages = ref<Message[]>([]);
const isConnected = ref(false);
const isUserTyping = ref(false);
const hasMoreMessages = ref(false);
const loadingMore = ref(false);
const currentUserId = ref("currentUser"); // Get from auth
const messagesContainer = ref<HTMLElement>();

// WebSocket
let ws: WebSocket | null = null;
let typingTimer: NodeJS.Timeout | null = null;

// Computed
const activeConv = computed(() =>
  conversations.value.find((conv) => conv.id === activeConversation.value),
);

const getBidStatusColor = (status: string) => {
  switch (status) {
    case "accepted":
      return "text-green-600 bg-green-100";
    case "rejected":
      return "text-red-600 bg-red-100";
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getBidStatusIcon = (status: string) => {
  switch (status) {
    case "accepted":
      return CheckCircle;
    case "rejected":
      return XCircle;
    case "pending":
      return Clock;
    default:
      return Clock;
  }
};

// WebSocket functions
const connectWebSocket = () => {
  ws = new WebSocket("ws://localhost:3000/api/websocket");

  ws.onopen = () => {
    isConnected.value = true;
    console.log("Connected to chat");

    if (activeConversation.value) {
      ws?.send(
        JSON.stringify({
          type: "join_room",
          room: activeConversation.value,
          userId: currentUserId.value,
        }),
      );
    }
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "new_message":
        handleNewMessage(data.message);
        break;
      case "message_read":
        handleMessageStatusUpdate(data.messageId, "read");
        break;
      case "user_typing":
        if (data.userId !== currentUserId.value) {
          handleTypingIndicator(true);
        }
        break;
      case "user_stop_typing":
        if (data.userId !== currentUserId.value) {
          handleTypingIndicator(false);
        }
        break;
      case "conversation_history":
        messages.value = data.messages;
        hasMoreMessages.value = data.hasMore;
        scrollToBottom();
        break;
      case "bid_update":
        updateBidStatus(data.conversationId, data.bidStatus);
        break;
    }
  };

  ws.onclose = () => {
    isConnected.value = false;
    console.log("Disconnected from chat");
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

// Message handlers
const handleNewMessage = (message: Message) => {
  const conversationId = getConversationId(
    message.errandId,
    message.senderId,
    message.recipientId,
  );

  if (conversationId === activeConversation.value) {
    messages.value.push(message);
    scrollToBottom();
  }

  updateConversationLastMessage(message);

  if (conversationId !== activeConversation.value) {
    toast({
      title: "New Message",
      description: `${getOtherUserName(conversationId)}: ${message.message.substring(0, 50)}...`,
    });
  }
};

const handleSendMessage = async (text: string) => {
  console.log("Send Message");

  if (!activeConversation.value || !text.trim() || !isConnected.value) return;

  const tempId = `temp-${Date.now()}`;
  const newMessage: Message = {
    id: tempId,
    errandId: activeConv.value!.errandId,
    senderId: currentUserId.value,
    recipientId: activeConv.value!.otherUserId,
    message: text,
    read: false,
    createdAt: new Date().toISOString(),
    status: "sending",
    pending: true,
  };

  messages.value.push(newMessage);
  scrollToBottom();

  ws?.send(
    JSON.stringify({
      type: "send_message",
      message: newMessage,
      room: activeConversation.value,
    }),
  );

  try {
    const response = await useApiRequest("/api/messages", {
      method: "POST",
      body: {
        errandId: newMessage.errandId,
        recipientId: newMessage.recipientId,
        message: newMessage.message,
      },
    });

    const messageIndex = messages.value.findIndex((m) => m.id === tempId);
    if (messageIndex !== -1) {
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        id: response.id,
        status: "sent",
        pending: false,
      };
    }
  } catch (error) {
    console.error("Failed to send message:", error);
    messages.value = messages.value.filter((m) => m.id !== tempId);
    toast({
      title: "Error",
      description: "Failed to send message",
      variant: "destructive",
    });
  }
};

const handleTyping = () => {
  if (!isConnected.value) return;

  ws?.send(
    JSON.stringify({
      type: "typing",
      room: activeConversation.value,
      userId: currentUserId.value,
    }),
  );
};

const handleStopTyping = () => {
  if (!isConnected.value) return;

  ws?.send(
    JSON.stringify({
      type: "stop_typing",
      room: activeConversation.value,
      userId: currentUserId.value,
    }),
  );
};

const handleTypingIndicator = (typing: boolean) => {
  isUserTyping.value = typing;

  if (typing) {
    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      isUserTyping.value = false;
    }, 3000);
  }
};

const handleMessageRead = async (messageId: string) => {
  try {
    await useApiRequest(`/api/messages/${messageId}/read`, {
      method: "PUT",
    });

    const messageIndex = messages.value.findIndex((m) => m.id === messageId);
    if (messageIndex !== -1) {
      messages.value[messageIndex].read = true;
    }
  } catch (error) {
    console.error("Failed to mark message as read:", error);
  }
};

const handleMessageStatusUpdate = (messageId: string, status: string) => {
  const messageIndex = messages.value.findIndex((m) => m.id === messageId);
  if (messageIndex !== -1) {
    messages.value[messageIndex].status = status as any;
  }
};

// Bid management
const handleBidAccept = async (conversationId: string) => {
  try {
    const conversation = conversations.value.find(
      (c) => c.id === conversationId,
    );
    if (!conversation) return;

    await $fetch(`/api/bids/accept`, {
      method: "POST",
      body: {
        errandId: conversation.errandId,
        runnerId: conversation.otherUserId,
      },
    });

    updateBidStatus(conversationId, "accepted");

    toast({
      title: "Bid Accepted",
      description: `You've accepted the bid from ${conversation.otherUserName}`,
    });
  } catch (error) {
    console.error("Failed to accept bid:", error);
    toast({
      title: "Error",
      description: "Failed to accept bid",
      variant: "destructive",
    });
  }
};

const handleBidReject = async (conversationId: string) => {
  try {
    const conversation = conversations.value.find(
      (c) => c.id === conversationId,
    );
    if (!conversation) return;

    await useApiRequest(`/api/bids/reject`, {
      method: "POST",
      body: {
        errandId: conversation.errandId,
        runnerId: conversation.otherUserId,
      },
    });

    updateBidStatus(conversationId, "rejected");

    toast({
      title: "Bid Rejected",
      description: `You've rejected the bid from ${conversation.otherUserName}`,
    });
  } catch (error) {
    console.error("Failed to reject bid:", error);
    toast({
      title: "Error",
      description: "Failed to reject bid",
      variant: "destructive",
    });
  }
};

const updateBidStatus = (conversationId: string, status: string) => {
  const convIndex = conversations.value.findIndex(
    (c) => c.id === conversationId,
  );
  if (convIndex !== -1) {
    conversations.value[convIndex].bidStatus = status as any;
  }
};

// Conversation functions
const setActiveConversation = async (conversationId: string) => {
  activeConversation.value = conversationId;

  await navigateTo(`/dashboard/messages/${conversationId}`);

  if (isConnected.value) {
    ws?.send(
      JSON.stringify({
        type: "join_room",
        room: conversationId,
        userId: currentUserId.value,
      }),
    );
  }

  await loadMessages(conversationId);
  markConversationAsRead(conversationId);
};

const loadMessages = async (conversationId: string, offset = 0) => {
  try {
    const conversation = conversations.value.find(
      (c) => c.id === conversationId,
    );
    if (!conversation) return;

    const { data } = await useApiFetch<Message[]>(`/api/messages`, {
      query: {
        errandId: conversation.errandId,
        senderId: currentUserId.value,
        recipientId: conversation.otherUserId,
        offset,
        limit: 50,
      },
    });

    if (offset === 0) {
      messages.value = data.value || [];
      scrollToBottom();
    } else {
      messages.value = [...(data.value || []), ...messages.value];
    }

    hasMoreMessages.value = (data.value?.length || 0) === 50;
  } catch (error) {
    console.error("Failed to load messages:", error);
  }
};

const loadMoreMessages = async () => {
  if (loadingMore.value || !hasMoreMessages.value) return;

  loadingMore.value = true;
  await loadMessages(activeConversation.value!, messages.value.length);
  loadingMore.value = false;
};

const loadConversations = async () => {
  try {
    const { data } = await useApiFetch<{ conversations: Conversation[] }>(
      "/api/conversations",
    );
    if (data.value) {
      conversations.value = data.value.conversations;
    }
  } catch (error) {
    console.error("Failed to load conversations:", error);
  }
};

const markConversationAsRead = (conversationId: string) => {
  const convIndex = conversations.value.findIndex(
    (c) => c.id === conversationId,
  );
  if (convIndex !== -1) {
    conversations.value[convIndex].unread = 0;
  }
};

const updateConversationLastMessage = (message: Message) => {
  const conversationId = getConversationId(
    message.errandId,
    message.senderId,
    message.recipientId,
  );
  const convIndex = conversations.value.findIndex(
    (c) => c.id === conversationId,
  );

  if (convIndex !== -1) {
    conversations.value[convIndex].lastMessage = message.message;
    conversations.value[convIndex].timestamp = message.createdAt;
    if (message.senderId !== currentUserId.value) {
      conversations.value[convIndex].unread += 1;
    }
  }
};

// Utility functions
const getConversationId = (
  errandId: string,
  senderId: string,
  recipientId: string,
) => {
  const otherUserId = senderId === currentUserId.value ? recipientId : senderId;
  return `${errandId}-${otherUserId}`;
};

const getOtherUserName = (conversationId: string) => {
  const conv = conversations.value.find((c) => c.id === conversationId);
  return conv?.otherUserName || "Unknown User";
};

const getInitials = (name: string) => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"
  );
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const handleScroll = () => {
  if (messagesContainer.value) {
    const { scrollTop } = messagesContainer.value;
    if (scrollTop === 0 && hasMoreMessages.value && !loadingMore.value) {
      loadMoreMessages();
    }
  }
};

// Lifecycle
onMounted(async () => {
  await loadConversations();
  connectWebSocket();

  if (activeConversation.value) {
    await loadMessages(activeConversation.value);
  }
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
  if (typingTimer) {
    clearTimeout(typingTimer);
  }
});

// Watchers
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && newId !== activeConversation.value) {
      await setActiveConversation(newId as string);
    }
  },
);
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
  >
    <div class="flex-1 p-4 lg:p-6">
      <div class="container mx-auto max-w-7xl h-[calc(100vh-8rem)]">
        <div
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 h-full overflow-hidden"
        >
          <div class="grid grid-cols-1 lg:grid-cols-4 h-full">
            <!-- Conversations Sidebar -->
            <div
              class="lg:col-span-1 border-r border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50"
            >
              <div
                class="p-6 border-b border-slate-200/50 dark:border-slate-700/50"
              >
                <div class="flex items-center justify-between">
                  <h2
                    class="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent"
                  >
                    Messages
                  </h2>
                  <div class="flex items-center space-x-2">
                    <div class="flex items-center space-x-1">
                      <div
                        :class="[
                          'w-2 h-2 rounded-full transition-colors duration-300',
                          isConnected ? 'bg-green-500' : 'bg-red-500',
                        ]"
                      ></div>
                      <span class="text-xs text-slate-500 dark:text-slate-400">
                        {{ isConnected ? "Online" : "Offline" }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="overflow-y-auto flex-1 max-h-[calc(100vh-12rem)]">
                <div class="p-4 space-y-2">
                  <div
                    v-for="conversation in conversations"
                    :key="conversation.id"
                    @click="setActiveConversation(conversation.id)"
                    :class="[
                      'p-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200/50 hover:shadow-md',
                      activeConversation === conversation.id
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200/50 dark:border-blue-700/50'
                        : 'hover:bg-white/50 dark:hover:bg-slate-800/50',
                    ]"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="relative flex-shrink-0">
                        <Avatar class="w-12 h-12 ring-2 ring-white shadow-sm">
                          <AvatarImage :src="conversation.otherUserAvatar" />
                          <AvatarFallback
                            class="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm"
                          >
                            {{ getInitials(conversation.otherUserName) }}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          v-if="conversation.unread > 0"
                          class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                        >
                          {{
                            conversation.unread > 9 ? "9+" : conversation.unread
                          }}
                        </div>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                          <h3
                            class="font-semibold text-sm text-slate-900 dark:text-white truncate"
                          >
                            {{ conversation.otherUserName }}
                          </h3>
                          <span
                            class="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0"
                          >
                            {{
                              new Date(
                                conversation.timestamp,
                              ).toLocaleDateString()
                            }}
                          </span>
                        </div>

                        <p
                          class="text-xs text-slate-600 dark:text-slate-300 mb-2 truncate"
                        >
                          📋 {{ conversation.errandTitle }}
                        </p>

                        <!-- Bid Information -->
                        <div
                          v-if="conversation.bidAmount"
                          class="flex items-center justify-between mb-2"
                        >
                          <div class="flex items-center space-x-2">
                            <DollarSign class="w-3 h-3 text-green-600" />
                            <span class="text-xs font-semibold text-green-600">
                              KES {{ conversation.bidAmount.toLocaleString() }}
                            </span>
                          </div>

                          <div
                            v-if="conversation.bidStatus"
                            :class="[
                              'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                              getBidStatusColor(conversation.bidStatus),
                            ]"
                          >
                            <component
                              :is="getBidStatusIcon(conversation.bidStatus)"
                              class="w-3 h-3"
                            />
                            <span class="capitalize">{{
                              conversation.bidStatus
                            }}</span>
                          </div>
                        </div>

                        <p
                          class="text-xs text-slate-500 dark:text-slate-400 truncate"
                        >
                          {{ conversation.lastMessage }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Messages Area -->
            <div class="lg:col-span-3 flex flex-col h-full">
              <div v-if="activeConversation" class="flex flex-col h-full">
                <!-- Chat Header -->
                <div
                  class="p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="relative">
                        <Avatar class="w-12 h-12 ring-2 ring-white shadow-lg">
                          <AvatarImage :src="activeConv?.otherUserAvatar" />
                          <AvatarFallback
                            class="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold"
                          >
                            {{ getInitials(activeConv?.otherUserName) }}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                        ></div>
                      </div>
                      <div class="flex-1">
                        <h3
                          class="font-bold text-lg text-slate-900 dark:text-white"
                        >
                          {{ activeConv?.otherUserName }}
                        </h3>
                        <p
                          class="text-sm text-slate-500 dark:text-slate-400 flex items-center"
                        >
                          <span class="mr-2">📋</span>
                          {{ activeConv?.errandTitle }}
                        </p>

                        <!-- Bid info in header -->
                        <div
                          v-if="activeConv?.bidAmount"
                          class="flex items-center space-x-4 mt-1"
                        >
                          <div
                            class="flex items-center space-x-1 text-sm text-green-600"
                          >
                            <DollarSign class="w-4 h-4" />
                            <span class="font-semibold"
                              >KES
                              {{ activeConv.bidAmount.toLocaleString() }}</span
                            >
                          </div>

                          <div
                            v-if="activeConv.bidStatus"
                            :class="[
                              'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                              getBidStatusColor(activeConv.bidStatus),
                            ]"
                          >
                            <component
                              :is="getBidStatusIcon(activeConv.bidStatus)"
                              class="w-3 h-3"
                            />
                            <span class="capitalize">{{
                              activeConv.bidStatus
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Bid Actions for Requesters -->
                    <div
                      v-if="
                        activeConv?.userRole === 'requester' &&
                        activeConv?.bidStatus === 'pending'
                      "
                      class="flex space-x-2"
                    >
                      <Button
                        @click="handleBidAccept(activeConv.id)"
                        size="sm"
                        class="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle class="w-4 h-4 mr-1" />
                        Accept Bid
                      </Button>
                      <Button
                        @click="handleBidReject(activeConv.id)"
                        variant="outline"
                        size="sm"
                        class="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle class="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>

                <!-- Messages Container -->
                <div
                  ref="messagesContainer"
                  @scroll="handleScroll"
                  class="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/30 to-white/50 dark:from-slate-800/30 dark:to-slate-900/50"
                >
                  <!-- Load More Messages -->
                  <div v-if="hasMoreMessages" class="text-center py-2">
                    <Button
                      @click="loadMoreMessages"
                      :disabled="loadingMore"
                      variant="ghost"
                      size="sm"
                      class="text-slate-500 hover:text-slate-700"
                    >
                      <Loader2
                        v-if="loadingMore"
                        class="w-4 h-4 mr-2 animate-spin"
                      />
                      Load More Messages
                    </Button>
                  </div>

                  <!-- Messages -->
                  <div
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
                        'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm relative',
                        message.senderId === currentUserId
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-12'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white mr-12 border border-slate-200/50 dark:border-slate-700/50',
                      ]"
                    >
                      <p class="text-sm leading-relaxed">
                        {{ message.message }}
                      </p>

                      <div
                        :class="[
                          'flex items-center justify-between mt-2 text-xs',
                          message.senderId === currentUserId
                            ? 'text-blue-100'
                            : 'text-slate-500 dark:text-slate-400',
                        ]"
                      >
                        <span>{{
                          new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        }}</span>

                        <!-- Message Status for Sent Messages -->
                        <div
                          v-if="message.senderId === currentUserId"
                          class="flex items-center ml-2"
                        >
                          <Loader2
                            v-if="message.status === 'sending'"
                            class="w-3 h-3 animate-spin"
                          />
                          <CheckCircle
                            v-else-if="message.status === 'read'"
                            class="w-3 h-3"
                          />
                          <CheckCircle
                            v-else-if="message.status === 'delivered'"
                            class="w-3 h-3 opacity-60"
                          />
                          <Clock v-else class="w-3 h-3 opacity-60" />
                        </div>
                      </div>

                      <!-- Message Tail -->
                      <div
                        :class="[
                          'absolute top-4 w-3 h-3 transform rotate-45',
                          message.senderId === currentUserId
                            ? 'bg-blue-500 -right-1'
                            : 'bg-white dark:bg-slate-800 -left-1 border-l border-t border-slate-200/50 dark:border-slate-700/50',
                        ]"
                      ></div>
                    </div>
                  </div>

                  <!-- Typing Indicator -->
                  <div v-if="isUserTyping" class="flex justify-start">
                    <div
                      class="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3 rounded-2xl shadow-sm mr-12"
                    >
                      <div class="flex space-x-1">
                        <div
                          class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        ></div>
                        <div
                          class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style="animation-delay: 0.1s"
                        ></div>
                        <div
                          class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style="animation-delay: 0.2s"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Message Input -->
                <div
                  class="p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50"
                >
                  <MessagingMessageInput
                    @sendMessage="handleSendMessage"
                    @typing="handleTyping"
                    @stop-typing="handleStopTyping"
                    :disabled="!isConnected"
                    :placeholder="
                      isConnected ? 'Type your message...' : 'Connecting...'
                    "
                  />
                </div>
              </div>

              <!-- No Conversation Selected -->
              <div v-else class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <MessageSquare
                    class="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4"
                  />
                  <h3
                    class="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2"
                  >
                    Select a conversation
                  </h3>
                  <p class="text-slate-500 dark:text-slate-400">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

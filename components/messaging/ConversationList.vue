<template>
  <div class="space-y-1 p-2">
    <div
      v-for="conversation in conversations"
      :key="conversation.id"
      @click="$emit('selectConversation', conversation.id)"
      :class="[
        'p-4 rounded-xl cursor-pointer transition-all duration-200 group',
        'hover:bg-white/70 dark:hover:bg-slate-700/50',
        activeConversation === conversation.id
          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-700 shadow-md'
          : 'hover:shadow-sm',
      ]"
    >
      <div class="flex items-center space-x-3">
        <div class="relative flex-shrink-0">
          <Avatar class="w-12 h-12">
            <AvatarImage :src="conversation.otherUserAvatar" />
            <AvatarFallback
              class="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm"
            >
              {{ getInitials(conversation.otherUserName) }}
            </AvatarFallback>
          </Avatar>
          <div
            v-if="conversation.unread > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
          >
            {{ conversation.unread > 9 ? "9+" : conversation.unread }}
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <h4
              :class="[
                'font-semibold text-sm truncate',
                conversation.unread > 0
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-700 dark:text-slate-300',
              ]"
            >
              {{ conversation.otherUserName }}
            </h4>
            <span
              class="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0"
            >
              {{ formatTime(conversation.timestamp) }}
            </span>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-400 mb-1 truncate">
            {{ conversation.errandTitle }}
          </p>

          <p
            :class="[
              'text-sm truncate',
              conversation.unread > 0
                ? 'text-slate-900 dark:text-white font-medium'
                : 'text-slate-500 dark:text-slate-400',
            ]"
          >
            {{ conversation.lastMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
}

defineProps<{
  conversations: Conversation[];
  activeConversation: string | null;
}>();

defineEmits<{
  selectConversation: [id: string];
}>();

const getInitials = (name: string) => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"
  );
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return minutes <= 1 ? "now" : `${minutes}m`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else {
    const days = Math.floor(diffInHours / 24);
    return days === 1 ? "1d" : `${days}d`;
  }
};
</script>

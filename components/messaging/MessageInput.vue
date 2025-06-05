<script setup lang="ts">
import { Send, Smile, Paperclip } from "lucide-vue-next";

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  sendMessage: [message: string];
  typing: [];
  stopTyping: [];
}>();

// Reactive data
const message = ref("");
const showEmojiPicker = ref(false);
const textareaRef = ref<HTMLTextAreaElement>();
const fileInputRef = ref<HTMLInputElement>();
const isTyping = ref(false);

// Typing timer
let typingTimer: NodeJS.Timeout | null = null;

// Common emojis
const commonEmojis = [
  "😀",
  "😂",
  "😊",
  "😍",
  "🤔",
  "😢",
  "😡",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "💯",
  "🎉",
  "😎",
  "🤝",
  "👋",
  "🙏",
  "💪",
  "🎯",
  "⭐",
  "✅",
  "❌",
  "⚡",
  "🚀",
];

// Computed
const canSend = computed(
  () =>
    message.value.trim().length > 0 &&
    message.value.length <= 300 &&
    !props.disabled,
);

// Methods
const handleSend = () => {
  if (!canSend.value) return;

  const messageText = message.value.trim();
  emit("sendMessage", messageText);
  message.value = "";
  adjustTextareaHeight();

  // Stop typing indicator
  if (isTyping.value) {
    emit("stopTyping");
    isTyping.value = false;
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    if (event.shiftKey) {
      // Allow new line with Shift+Enter
      return;
    } else {
      // Send message with Enter
      event.preventDefault();
      handleSend();
    }
  }
};

const handleInput = () => {
  adjustTextareaHeight();

  // Typing indicator logic
  if (!isTyping.value && message.value.trim()) {
    isTyping.value = true;
    emit("typing");
  }

  // Reset typing timer
  if (typingTimer) {
    clearTimeout(typingTimer);
  }

  typingTimer = setTimeout(() => {
    if (isTyping.value) {
      isTyping.value = false;
      emit("stopTyping");
    }
  }, 2000);
};

const handleFocus = () => {
  showEmojiPicker.value = false;
};

const handleBlur = () => {
  // Delay hiding emoji picker to allow clicks
  setTimeout(() => {
    showEmojiPicker.value = false;
  }, 200);
};

const adjustTextareaHeight = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
      textareaRef.value.style.height =
        Math.min(textareaRef.value.scrollHeight, 128) + "px";
    }
  });
};

const addEmoji = (emoji: string) => {
  message.value += emoji;
  showEmojiPicker.value = false;
  textareaRef.value?.focus();
  adjustTextareaHeight();
};

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    // Handle file upload logic here
    console.log("Files selected:", files);
    // You can emit an event or handle file upload
  }
};

// Lifecycle
onMounted(() => {
  adjustTextareaHeight();
});

onUnmounted(() => {
  if (typingTimer) {
    clearTimeout(typingTimer);
  }
});

// Click outside to close emoji picker
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".emoji-picker-container")) {
    showEmojiPicker.value = false;
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
  <div class="relative">
    <div class="flex items-end space-x-3">
      <!-- Emoji Button -->
      <Button
        variant="ghost"
        size="sm"
        class="flex-shrink-0 mb-2 w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        @click="showEmojiPicker = !showEmojiPicker"
      >
        <Smile class="w-5 h-5 text-slate-500" />
      </Button>

      <!-- Message Input -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="message"
          @keydown="handleKeyDown"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          :disabled="disabled"
          placeholder="Type your message..."
          :class="[
            'w-full resize-none border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 pr-12',
            'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
            'placeholder:text-slate-500 dark:placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px] max-h-32',
          ]"
          rows="1"
        />

        <!-- Character count -->
        <div
          v-if="message.length > 200"
          :class="[
            'absolute bottom-2 right-14 text-xs',
            message.length > 280 ? 'text-red-500' : 'text-slate-400',
          ]"
        >
          {{ message.length }}/300
        </div>
      </div>

      <!-- Send Button -->
      <Button
        @click="handleSend"
        :disabled="!canSend"
        :class="[
          'flex-shrink-0 mb-2 w-12 h-12 rounded-full transition-all duration-200',
          canSend
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed',
        ]"
      >
        <Send
          :class="[
            'w-5 h-5 transition-transform duration-200',
            canSend ? 'transform translate-x-0.5' : '',
          ]"
        />
      </Button>
    </div>

    <!-- Emoji Picker (Simple) -->
    <div
      v-if="showEmojiPicker"
      class="absolute bottom-16 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-10"
    >
      <div class="grid grid-cols-8 gap-2">
        <button
          v-for="emoji in commonEmojis"
          :key="emoji"
          @click="addEmoji(emoji)"
          class="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg p-2 transition-colors duration-150"
        >
          {{ emoji }}
        </button>
      </div>
    </div>

    <!-- File Upload Area (Hidden) -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*,video/*,.pdf,.doc,.docx"
      @change="handleFileSelect"
      class="hidden"
    />
  </div>
</template>

<style scoped>
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>

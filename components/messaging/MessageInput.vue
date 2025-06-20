<template>
  <div class="relative w-full">
    <!-- Mobile Layout (< 640px) -->
    <div class="sm:hidden">
      <!-- Input Area -->
      <div class="flex flex-col space-y-3">
        <div class="relative">
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
              'w-full resize-none border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 pr-4',
              'bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base',
              'placeholder:text-slate-500 dark:placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-[44px] max-h-32',
              'touch-manipulation',
            ]"
            rows="1"
          />

          <!-- Character count - Mobile -->
          <div
            v-if="message.length > 200"
            :class="[
              'absolute -bottom-6 right-0 text-xs',
              message.length > 280 ? 'text-red-500' : 'text-slate-400',
            ]"
          >
            {{ message.length }}/300
          </div>
        </div>

        <!-- Action Buttons Row - Mobile -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <!-- Emoji Button - Mobile -->
            <Button
              variant="ghost"
              size="sm"
              class="flex-shrink-0 w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
              @click.prevent="toggleEmojiPicker()"
            >
              <Smile class="w-5 h-5 text-slate-500" />
            </Button>

            <!-- File Upload Button - Mobile -->
            <Button
              variant="ghost"
              size="sm"
              class="flex-shrink-0 w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
              @click="triggerFileUpload"
            >
              <Paperclip class="w-5 h-5 text-slate-500" />
            </Button>

            <!-- Voice Message Button - Mobile -->
            <Button
              variant="ghost"
              size="sm"
              class="flex-shrink-0 w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
              @click="toggleVoiceRecording"
            >
              <Mic
                :class="[
                  'w-5 h-5',
                  isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500',
                ]"
              />
            </Button>
          </div>

          <!-- Send Button - Mobile -->
          <Button
            @click="handleSend"
            :disabled="!canSend"
            :class="[
              'flex-shrink-0 w-12 h-12 rounded-full transition-all duration-200 touch-manipulation',
              canSend
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl active:scale-95'
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
      </div>
    </div>

    <!-- Desktop Layout (>= 640px) -->
    <div class="hidden sm:block">
      <div class="flex items-end space-x-3">
        <!-- Action Buttons Group - Desktop -->
        <div class="flex items-center space-x-1 mb-2">
          <!-- Emoji Button - Desktop -->
          <Button
            variant="ghost"
            size="sm"
            class="flex-shrink-0 w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            @click.prevent="toggleEmojiPicker()"
          >
            <Smile class="w-5 h-5 text-slate-500" />
          </Button>

          <!-- File Upload Button - Desktop -->
          <Button
            variant="ghost"
            size="sm"
            class="flex-shrink-0 w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            @click="triggerFileUpload"
          >
            <Paperclip class="w-5 h-5 text-slate-500" />
          </Button>

          <!-- Voice Message Button - Desktop -->
          <Button
            variant="ghost"
            size="sm"
            class="flex-shrink-0 w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            @click="toggleVoiceRecording"
          >
            <Mic
              :class="[
                'w-5 h-5',
                isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500',
              ]"
            />
          </Button>
        </div>

        <!-- Message Input - Desktop -->
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

          <!-- Character count - Desktop -->
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

        <!-- Send Button - Desktop -->
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
    </div>

    <!-- Enhanced Emoji Picker -->
    <div
      v-if="showEmojiPicker"
      :class="[
        'absolute z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl backdrop-blur-sm',
        'sm:bottom-16 sm:left-0',
        'bottom-20 left-1/2 transform -translate-x-1/2 sm:transform-none sm:translate-x-0',
        'w-80 sm:w-72',
        'max-h-64 overflow-y-auto',
      ]"
    >
      <!-- Emoji Picker Header -->
      <div
        class="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700"
      >
        <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Choose an emoji
        </h3>
        <Button
          variant="ghost"
          size="sm"
          class="w-6 h-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          @click="showEmojiPicker = false"
        >
          <X class="w-4 h-4" />
        </Button>
      </div>

      <!-- Emoji Categories -->
      <div class="p-3">
        <div class="grid grid-cols-8 sm:grid-cols-6 gap-1">
          <button
            v-for="emoji in commonEmojis"
            :key="emoji"
            @click="addEmoji(emoji)"
            class="text-xl sm:text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg p-2 transition-colors duration-150 touch-manipulation"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>

    <!-- File Preview Area -->
    <div
      v-if="selectedFiles.length > 0"
      class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Selected Files ({{ selectedFiles.length }})
        </span>
        <Button
          variant="ghost"
          size="sm"
          class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          @click="clearFiles"
        >
          <X class="w-4 h-4" />
        </Button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="relative group"
        >
          <div
            class="flex items-center space-x-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <FileIcon class="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span class="text-xs text-slate-600 dark:text-slate-400 truncate">
              {{ file.name }}
            </span>
            <Button
              variant="ghost"
              size="sm"
              class="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removeFile(index)"
            >
              <X class="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Recording Indicator -->
    <div
      v-if="isRecording"
      class="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse"
    >
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
        <span>Recording... {{ recordingTime }}s</span>
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

    <!-- Mobile Keyboard Spacer -->
    <div v-if="isMobile && isInputFocused" class="h-4 sm:hidden"></div>
  </div>
</template>

<script setup lang="ts">
import { type Ref } from "vue";
import { Smile, Send, Paperclip, Mic, X, FileIcon } from "lucide-vue-next";

// Types
interface MessageData {
  text: string;
  files: File[];
}

interface VoiceMessageData {
  duration: number;
}

// Props
interface Props {
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// Emits
interface Emits {
  (e: "send-message", data: string): void;
  (e: "typing", isTyping: boolean): void;
  (e: "file-upload", files: File[]): void;
  (e: "voice-message", data: VoiceMessageData): void;
}

const emit = defineEmits<Emits>();

// Reactive data
const message: Ref<string> = ref("");
const showEmojiPicker: Ref<boolean> = ref(false);
const selectedFiles: Ref<File[]> = ref([]);
const isRecording: Ref<boolean> = ref(false);
const recordingTime: Ref<number> = ref(0);
const isInputFocused: Ref<boolean> = ref(false);
const isMobile: Ref<boolean> = ref(false);

// Refs
const textareaRef: Ref<HTMLTextAreaElement | null> = ref(null);
const fileInputRef: Ref<HTMLInputElement | null> = ref(null);

// Timer reference
let recordingTimer: NodeJS.Timeout | null = null;

// Computed
const canSend = computed((): boolean => {
  return (
    (message.value.trim().length > 0 || selectedFiles.value.length > 0) &&
    !props.disabled
  );
});

// Common emojis
const commonEmojis: readonly string[] = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "👍",
  "👎",
  "👌",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "🤙",
  "👈",
  "👉",
  "👆",
  "👇",
  "☝️",
  "✋",
  "🤚",
  "🖐️",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
] as const;

// Methods
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }

  // Emit typing event
  emit("typing", true);
};

const handleInput = (): void => {
  // Auto-resize textarea
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
  }

  // Emit typing event
  emit("typing", message.value.length > 0);
};
const toggleEmojiPicker = () => {
  console.log(showEmojiPicker.value);
  showEmojiPicker.value = !showEmojiPicker.value;
};

const handleFocus = (): void => {
  isInputFocused.value = true;
};

const handleBlur = (): void => {
  isInputFocused.value = false;
  emit("typing", false);
};

const handleSend = (): void => {
  if (!canSend.value) return;

  const messageData: MessageData = {
    text: message.value.trim(),
    files: [...selectedFiles.value],
  };

  emit("send-message", messageData.text);

  // Reset form
  message.value = "";
  selectedFiles.value = [];
  showEmojiPicker.value = false;

  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto";
  }
};

const addEmoji = (emoji: string): void => {
  const textarea = textareaRef.value;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = message.value;
    message.value = text.substring(0, start) + emoji + text.substring(end);

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  } else {
    message.value += emoji;
  }

  showEmojiPicker.value = false;
};

const triggerFileUpload = (): void => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    selectedFiles.value = [...selectedFiles.value, ...files];

    // Emit file upload event
    emit("file-upload", files);

    // Reset input
    target.value = "";
  }
};

const removeFile = (index: number): void => {
  selectedFiles.value.splice(index, 1);
};

const clearFiles = (): void => {
  selectedFiles.value = [];
};

const toggleVoiceRecording = (): void => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

const startRecording = (): void => {
  isRecording.value = true;
  recordingTime.value = 0;

  // Start timer
  recordingTimer = setInterval(() => {
    recordingTime.value++;
    if (recordingTime.value >= 60) {
      stopRecording();
    }
  }, 1000);
};

const stopRecording = (): void => {
  const duration = recordingTime.value;

  isRecording.value = false;
  recordingTime.value = 0;

  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }

  // Emit voice message event
  emit("voice-message", { duration });
};

// Detect mobile device
const checkMobile = (): void => {
  isMobile.value = window.innerWidth < 640;
};

// Click outside handler
const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement;
  if (!target.closest(".emoji-picker-container")) {
    // showEmojiPicker.value = false;
  }
};
//
// Lifecycle
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  document.removeEventListener("click", handleClickOutside);

  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
});
</script>

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

/* Enhanced mobile touch targets */
@media (max-width: 640px) {
  .touch-manipulation {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  /* Ensure minimum touch target size */
  button {
    min-height: 44px;
    min-width: 44px;
  }

  /* Improve textarea on mobile */
  textarea {
    font-size: 16px; /* Prevents zoom on iOS */
    -webkit-appearance: none;
    border-radius: 16px;
  }

  /* Better focus states on mobile */
  textarea:focus {
    transform: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
}

/* Smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Active states for better mobile feedback */
button:active {
  transform: scale(0.95);
}

/* Improved emoji picker positioning */
.emoji-picker-container {
  position: relative;
}

/* Custom scrollbar for emoji picker */
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

/* File preview animations */
.file-preview-enter-active,
.file-preview-leave-active {
  transition: all 0.3s ease;
}

.file-preview-enter-from,
.file-preview-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Recording pulse animation */
@keyframes recordingPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.recording-indicator {
  animation: recordingPulse 1s infinite;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-slate-200 {
    border-color: #000;
  }

  .dark .border-slate-700 {
    border-color: #fff;
  }
}

/* Focus visible for keyboard navigation */
button:focus-visible,
textarea:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>

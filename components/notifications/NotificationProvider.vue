<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { toast } from 'vue-sonner';

interface Notification {
  id: string;
  type: 'new_bid' | 'bid_accepted' | 'errand_update' | 'message' | 'payment' | 'review' | 'system_alert' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

// Store
const authStore = useAuthStore();
const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const isConnected = ref(false);
const showNotifications = ref(false);

// Server-Sent Events connection
let eventSource: EventSource | null = null;

// Connect to SSE for real-time notifications
const connectToNotifications = () => {
  if (!authStore.user) return;
  
  try {
    eventSource = new EventSource(`/api/notifications/stream`, {
      withCredentials: true
    });
    
    eventSource.onopen = () => {
      isConnected.value = true;
      console.log('Connected to notification stream');
    };
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      handleNewNotification(notification);
    };
    
    eventSource.onerror = (error) => {
      console.error('Notification stream error:', error);
      isConnected.value = false;
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (authStore.user && !isConnected.value) {
          connectToNotifications();
        }
      }, 5000);
    };
  } catch (error) {
    console.error('Failed to connect to notification stream:', error);
  }
};

// Handle new incoming notifications
const handleNewNotification = (notification: Notification) => {
  // Add to notifications list
  notifications.value.unshift(notification);
  
  // Update unread count
  if (!notification.read) {
    unreadCount.value++;
  }
  
  // Show toast notification
  const toastConfig = {
    duration: 5000,
    action: notification.relatedId ? {
      label: 'View',
      onClick: () => navigateToRelated(notification)
    } : undefined
  };
  
  switch (notification.type) {
    case 'bid_accepted':
      toast.success(notification.title, {
        description: notification.message,
        ...toastConfig
      });
      break;
    case 'new_bid':
      toast.info(notification.title, {
        description: notification.message,
        ...toastConfig
      });
      break;
    case 'payment':
      toast.success(notification.title, {
        description: notification.message,
        ...toastConfig
      });
      break;
    case 'errand_update':
      toast.info(notification.title, {
        description: notification.message,
        ...toastConfig
      });
      break;
    case 'system_alert':
      toast.warning(notification.title, {
        description: notification.message,
        ...toastConfig
      });
      break;
    default:
      toast(notification.title, {
        description: notification.message,
        ...toastConfig
      });
  }
};

// Navigate to related content
const navigateToRelated = (notification: Notification) => {
  if (!notification.relatedId) return;
  
  switch (notification.type) {
    case 'new_bid':
    case 'bid_accepted':
    case 'errand_update':
      navigateTo(`/dashboard/errands/${notification.relatedId}`);
      break;
    case 'message':
      navigateTo(`/dashboard/messages`);
      break;
    case 'payment':
      navigateTo(`/dashboard/transactions`);
      break;
  }
  
  showNotifications.value = false;
};

// Fetch initial notifications
const fetchNotifications = async () => {
  try {
    const { data } = await useApiFetch<{
      success: boolean;
      data: Notification[];
      meta: { unread: number };
    }>('/api/notifications?limit=20');
    
    if (data.value?.success) {
      notifications.value = data.value.data;
      unreadCount.value = data.value.meta.unread;
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};

// Mark notification as read
const markAsRead = async (notificationId: string) => {
  try {
    await useApiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
    
    // Update local state
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

// Mark all as read
const markAllAsRead = async () => {
  try {
    await useApiRequest('/api/notifications/mark-all-read', {
      method: 'PUT'
    });
    
    // Update local state
    notifications.value.forEach(n => n.read = true);
    unreadCount.value = 0;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};

// Format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

// Get notification icon
const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_bid': return 'mdi:hand-coin';
    case 'bid_accepted': return 'mdi:check-circle';
    case 'errand_update': return 'mdi:update';
    case 'message': return 'mdi:message';
    case 'payment': return 'mdi:credit-card';
    case 'review': return 'mdi:star';
    case 'system_alert': return 'mdi:alert';
    case 'achievement': return 'mdi:trophy';
    default: return 'mdi:bell';
  }
};

// Lifecycle
onMounted(() => {
  if (authStore.user) {
    fetchNotifications();
    connectToNotifications();
  }
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
});

// Watch for auth changes
watch(() => authStore.user, (user) => {
  if (user) {
    fetchNotifications();
    connectToNotifications();
  } else {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    notifications.value = [];
    unreadCount.value = 0;
  }
});

// Provide to children
provide('notifications', {
  notifications: readonly(notifications),
  unreadCount: readonly(unreadCount),
  isConnected: readonly(isConnected),
  showNotifications,
  markAsRead,
  markAllAsRead
});
</script>

<template>
  <div>
    <!-- Notification Bell Button -->
    <Popover v-model:open="showNotifications">
      <PopoverTrigger as-child>
        <Button variant="ghost" size="sm" class="relative">
          <Icon name="mdi:bell" class="h-5 w-5" />
          <Badge
            v-if="unreadCount > 0"
            variant="destructive"
            class="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </Badge>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent class="w-80 p-0" align="end">
        <div class="border-b p-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Notifications</h3>
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                ]"
                :title="isConnected ? 'Connected' : 'Disconnected'"
              />
              <Button
                v-if="unreadCount > 0"
                variant="ghost"
                size="sm"
                @click="markAllAsRead"
                class="text-xs"
              >
                Mark all read
              </Button>
            </div>
          </div>
        </div>
        
        <div class="max-h-96 overflow-y-auto">
          <div v-if="notifications.length === 0" class="p-8 text-center">
            <Icon name="mdi:bell-outline" class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">No notifications yet</p>
          </div>
          
          <div v-else class="divide-y">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              :class="[
                'p-3 hover:bg-muted/50 cursor-pointer transition-colors',
                !notification.read && 'bg-muted/30'
              ]"
              @click="() => {
                markAsRead(notification.id);
                navigateToRelated(notification);
              }"
            >
              <div class="flex gap-3">
                <div class="shrink-0">
                  <Icon
                    :name="getNotificationIcon(notification.type)"
                    class="h-5 w-5 text-muted-foreground"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm">{{ notification.title }}</p>
                  <p class="text-xs text-muted-foreground line-clamp-2">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ formatTime(notification.createdAt) }}
                  </p>
                </div>
                <div v-if="!notification.read" class="shrink-0">
                  <div class="w-2 h-2 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="notifications.length > 0" class="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            class="w-full"
            @click="() => {
              navigateTo('/dashboard/notifications');
              showNotifications = false;
            }"
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
    
    <!-- Slot for child components -->
    <slot />
  </div>
</template>

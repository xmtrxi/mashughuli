<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <Icon 
          name="mdi:alert-circle-outline" 
          class="mx-auto h-24 w-24 text-destructive mb-4"
        />
        <h1 class="text-3xl font-bold text-foreground mb-2">
          {{ errorTitle }}
        </h1>
        <p class="text-muted-foreground mb-6">
          {{ errorMessage }}
        </p>
      </div>
      
      <div class="space-y-4">
        <Button 
          @click="handleError" 
          class="w-full"
          variant="default"
        >
          <Icon name="mdi:refresh" class="mr-2 h-4 w-4" />
          Try Again
        </Button>
        
        <Button 
          @click="goHome" 
          variant="outline"
          class="w-full"
        >
          <Icon name="mdi:home" class="mr-2 h-4 w-4" />
          Go to Home
        </Button>
      </div>
      
      <div class="mt-8 text-sm text-muted-foreground">
        <p>If the problem persists, please contact support.</p>
        <p class="mt-2 font-mono text-xs">
          Error ID: {{ error?.statusCode || 'Unknown' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'

definePageMeta({
  layout: false
})

const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
    url?: string
  }
}>()

const errorTitle = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return 'Page Not Found'
    case 403:
      return 'Access Denied'
    case 401:
      return 'Unauthorized'
    case 500:
      return 'Server Error'
    default:
      return 'Something Went Wrong'
  }
})

const errorMessage = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return 'The page you are looking for might have been removed or does not exist.'
    case 403:
      return 'You do not have permission to access this resource.'
    case 401:
      return 'Please log in to access this page.'
    case 500:
      return 'We are experiencing technical difficulties. Please try again later.'
    default:
      return props.error?.statusMessage || props.error?.message || 'An unexpected error occurred.'
  }
})

const handleError = () => {
  clearError({ redirect: '/' })
}

const goHome = () => {
  navigateTo('/')
}

// Auto-refresh for server errors after 10 seconds
if (props.error?.statusCode && props.error.statusCode >= 500) {
  setTimeout(() => {
    handleError()
  }, 10000)
}
</script>

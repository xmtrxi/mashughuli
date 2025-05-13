<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";
const userData = {
  id: "user1",
  name: "John Doe",
  avatar: null,
  location: "Nairobi, Kenya",
  bio: "I frequently need help with errands while managing my small business. Reliable and fair with ratings.",
  memberSince: "2024-03-15",
  role: "requester",
  completedErrands: 12,
  rating: 4.8,
  reviews: [
    {
      id: "r1",
      reviewerId: "runner1",
      reviewerName: "Alex Smith",
      rating: 5,
      text: "Great person to work with! Clear instructions and fair payment.",
      date: "2025-04-20",
    },
    {
      id: "r2",
      reviewerId: "runner2",
      reviewerName: "Maria Johnson",
      rating: 4.5,
      text: "Good communication and reasonable requests.",
      date: "2025-03-15",
    },
  ],
  errands: [
    {
      id: "errand1",
      title: "Grocery Shopping & Delivery",
      status: "completed",
      date: "2025-05-01",
    },
    {
      id: "errand2",
      title: "Document Pickup",
      status: "in-progress",
      date: "2025-05-05",
    },
  ],
};

const bidderData = {
  id: "bidder1",
  name: "Alex Johnson",
  avatar: null,
  location: "Nakuru, Kenya",
  bio: "Professional runner with 3+ years of experience. Specialized in shopping and delivery errands.",
  memberSince: "2023-11-10",
  role: "runner",
  completedErrands: 56,
  rating: 4.9,
  reviews: [
    {
      id: "r3",
      reviewerId: "user1",
      reviewerName: "John Doe",
      rating: 5,
      text: "Alex was extremely efficient and handled my groceries with care.",
      date: "2025-05-02",
    },
    {
      id: "r4",
      reviewerId: "user3",
      reviewerName: "Sarah Wilson",
      rating: 4.8,
      text: "Very reliable and communicative throughout the errand.",
      date: "2025-04-28",
    },
  ],
  expertise: ["Shopping", "Delivery", "Pick-up"],
};
const runnerData = {
  id: "runner1",
  name: "Alex Smith",
  avatar: null,
  location: "Nairobi, Kenya",
  bio: "Professional runner with 3+ years of experience. Specialized in shopping and delivery errands.",
  memberSince: "2023-10-15",
  role: "runner",
  completedErrands: 56,
  rating: 4.9,
  reviews: [
    {
      id: "r5",
      reviewerId: "user1",
      reviewerName: "John Doe",
      rating: 5,
      text: "Alex was extremely efficient and handled my groceries with care.",
      date: "2025-05-02",
    },
    {
      id: "r6",
      reviewerId: "user3",
      reviewerName: "Sarah Wilson",
      rating: 4.8,
      text: "Very reliable and communicative throughout the errand.",
      date: "2025-04-28",
    },
  ],
  expertise: ["Shopping", "Delivery", "Pick-up"],
};
</script>
<template>
  <div class="container mx-auto mb-6 py-8">
    <div class="flex items-center mb-6">
      <NuxtLink
        :class="
          buttonVariants({ variant: 'ghost', class: 'flex items-center' })
        "
        :to="`/runners`"
      >
        <Icon name="mdi:arrow-left" class="h-4 w-4 mr-1" />
        Back
      </NuxtLink>
    </div>
    <div class="mb-8">
      <Card>
        <CardHeader>
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar class="w-20 h-20">
              <AvatarImage
                v-if="userData.avatar"
                :src="userData.avatar"
                :alt="userData.name"
              />
              <AvatarFallback v-else class="text-2xl">
                {{ userData.name.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>

            <div class="space-y-1 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <CardTitle>{{ userData.name }}</CardTitle>
                <Badge variant="outline" class="capitalize">
                  {{ userData.role }}
                </Badge>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="skill in runnerData.expertise"
                    :key="skill"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ skill }}
                  </Badge>
                </div>
              </div>

              <CardDescription class="flex items-center gap-1">
                <Icon name="mdi:map-marker" class="h-3 w-3" />
                {{ userData.location }}
              </CardDescription>

              <div class="flex flex-wrap gap-4 mt-2">
                <div class="flex items-center text-sm">
                  <Icon
                    name="mdi:star"
                    class="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1"
                  />
                  <span
                    >{{ userData.rating }} ({{
                      userData.reviews.length
                    }}
                    reviews)</span
                  >
                </div>
                <div class="flex items-center text-sm">
                  <Icon name="mdi:thumbs-up" class="h-4 w-4 mr-1" />
                  <span>{{ userData.completedErrands }} completed errands</span>
                </div>
                <div class="flex items-center text-sm">
                  <Icon name="mdi:calendar" class="h-4 w-4 mr-1" />
                  <span
                    >Member since
                    {{
                      new Date(userData.memberSince).toLocaleDateString()
                    }}</span
                  >
                </div>
              </div>
            </div>

            <div class="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" class="flex items-center gap-1">
                <Icon name="mdi:message" class="h-4 w-4" />
                Message
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h3 class="font-medium mb-2">About</h3>
          <p class="text-muted-foreground">{{ userData.bio }}</p>
        </CardContent>
      </Card>
    </div>
    <Tabs default-value="reviews" class="space-y-4">
      <TabsList>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="errands">Errands</TabsTrigger>
      </TabsList>
      <TabsContent value="reviews" class="space-y-4">
        <Card v-if="userData.reviews.length <= 0">
          <CardContent class="pt-6">
            <p class="text-center text-muted-foreground">No reviews yet</p>
          </CardContent>
        </Card>
        <Card v-else v-for="review in userData.reviews" :key="review.id">
          <CardContent class="pt-6">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h4 class="font-medium">{{ review.reviewerName }}</h4>
                <p class="text-sm text-muted-foreground">
                  {{ new Date(review.date).toLocaleDateString() }}
                </p>
              </div>
              <div class="flex items-center">
                <Icon
                  name="mdi:star"
                  v-for="i in 5"
                  :key="i"
                  class="bg-yellow-500"
                />
              </div>
            </div>
            <p>{{ review.text }}</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="errands">
        <NuxtLink
          v-for="errand in userData.errands"
          :key="errand.id"
          :to="`/errands/${errand.id}`"
        >
          <Card class="mb-4 hover:bg-accent/50 transition-colors">
            <CardContent class="pt-6">
              <div class="flex justify-between">
                <h4 class="font-medium">{{ errand.title }}</h4>
                <Badge
                  :variant="
                    errand.status === 'completed' ? 'default' : 'outline'
                  "
                >
                  {{
                    errand.status.charAt(0).toUpperCase() +
                    errand.status.slice(1)
                  }}
                </Badge>
              </div>
              <p class="text-sm text-muted-foreground">
                Posted on {{ new Date(errand.date).toLocaleDateString() }}
              </p>
            </CardContent>
          </Card>
        </NuxtLink>
      </TabsContent>
    </Tabs>
  </div>
</template>

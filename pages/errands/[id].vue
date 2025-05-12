<script setup lang="ts">
// Example errand data
const errand = {
  id: "1",
  title: "Grocery Shopping & Delivery",
  description:
    "I need someone to pick up groceries from Whole Foods Market on Main Street and deliver them to my apartment. I will provide a detailed shopping list including specific brands and alternatives if items are out of stock. Please handle fragile items with care and ensure cold items remain cold. Delivery should be made to the lobby of my apartment building where I will meet you.",
  location: "Downtown, Main Street",
  budget: { min: 15, max: 25, currency: "USD" },
  dueDate: "2025-05-05",
  category: "Shopping",
  priority: "medium",
  status: "open",
  createdAt: "2025-05-01",
  requester: {
    id: "user1",
    name: "John Doe",
    avatar: null,
    rating: 4.8,
    completedErrands: 12,
  },
};

// Example bids data
const bidsData = [
  {
    id: "bid1",
    userId: "runner1",
    userName: "Alex Smith",
    userAvatar: null,
    errandId: "1",
    amount: 20,
    currency: "USD",
    estimatedTime: "2 hours",
    coverLetter:
      "I can pick up your groceries and deliver them promptly. I have experience with careful handling of groceries and will make sure everything arrives in perfect condition.",
    createdAt: "2025-05-01T10:30:00",
    status: "pending",
    userRating: 4.9,
    completedErrands: 56,
  },
  {
    id: "bid2",
    userId: "runner2",
    userName: "Maria Johnson",
    userAvatar: null,
    errandId: "1",
    amount: 18,
    currency: "USD",
    estimatedTime: "1.5 hours",
    coverLetter:
      "I live near Whole Foods and can get this done quickly for you. I have my own insulated bags to keep cold items cold during transport.",
    createdAt: "2025-05-01T11:15:00",
    status: "pending",
    userRating: 4.7,
    completedErrands: 23,
  },
  {
    id: "bid3",
    userId: "runner3",
    userName: "James Wilson",
    userAvatar: null,
    errandId: "1",
    amount: 22,
    currency: "USD",
    estimatedTime: "2 hours",
    coverLetter:
      "Happy to help with your grocery shopping. I'm meticulous about following shopping lists and finding the exact items requested. I can text you while shopping if there are any questions.",
    createdAt: "2025-05-01T14:20:00",
    status: "pending",
    userRating: 5.0,
    completedErrands: 17,
  },
];

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formattedBudget = `${formatCurrency(errand.budget.min, errand.budget.currency)} - ${formatCurrency(errand.budget.max, errand.budget.currency)}`;
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center mb-6">
      <NuxtLink
        to="/errands"
        class="flex items-center text-muted-foreground hover:text-foreground"
      >
        <Icon name="mdi:arrow-left" class="h-4 w-4 mr-1" />
        Back to Errands
      </NuxtLink>
    </div>

    <div class="mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-3xl font-bold">{{ errand.title }}</h1>
        <div class="flex gap-2">
          <Badge :class="statusColors[errand.status]">
            {{ errand.status.charAt(0).toUpperCase() + errand.status.slice(1) }}
          </Badge>
          <Badge :class="priorityColors[errand.priority]">
            {{
              errand.priority.charAt(0).toUpperCase() + errand.priority.slice(1)
            }}
            Priority
          </Badge>
        </div>
      </div>
      <div class="flex flex-wrap gap-4 mt-4 text-sm">
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:calendar" class="h-4 w-4" />
          <span
            >Posted on
            {{ new Date(errand.createdAt).toLocaleDateString() }}</span
          >
        </div>
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:clock" class="h-4 w-4" />
          <span
            >Due by {{ new Date(errand.dueDate).toLocaleDateString() }}</span
          >
        </div>
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:map-marker" class="h-4 w-4" />
          <span>{{ errand.location }}</span>
        </div>
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:flag" class="h-4 w-4" />
          <span>{{ errand.category }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon name="mdi:dollar" class="h-4 w-4" />
          <span class="font-medium">{{ formattedBudget }}</span>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <Tabs default-value="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="bids" class="flex items-center gap-1">
                  Bids
                  <span
                    class="inline-flex items-center justify-center w-5 h-5 text-xs bg-muted rounded-full"
                  >
                    {{ bidsData.length }}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div>
                  <h3 class="text-lg font-medium mb-2">Description</h3>
                  <p class="text-muted-foreground whitespace-pre-line">
                    {{ errand.description }}
                  </p>
                </div>
                <div>
                  <h3 class="text-lg font-medium mb-2">Requester</h3>
                  <div class="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        v-if="errand.requester.avatar"
                        :src="errand.requester.avatar"
                        :alt="errand.requester.name"
                      />
                      <AvatarFallback>{{
                        errand.requester.name.charAt(0).toUpperCase()
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="font-medium">{{ errand.requester.name }}</div>
                      <div
                        class="flex items-center text-sm text-muted-foreground"
                      >
                        <span class="flex items-center">
                          <Icon
                            v-for="i in 5"
                            :key="i"
                            name="mdi:star"
                            :class="
                              i < errand.requester.rating ? 'bg-yellow-500' : ''
                            "
                          />
                          <span class="ml-1">{{
                            errand.requester.rating
                          }}</span>
                        </span>
                        <span class="mx-2">.</span>
                        <span
                          >{{ errand.requester.completedErrands }} Errands</span
                        >
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="mt-3 flex items-center gap-1"
                  >
                    <Icon name="mdi:message" />
                    Message Requester
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="bids" :class="`mt-4`">
                <ErrandsBidderCard
                  v-for="bid in bidsData"
                  :key="bid.id"
                  :bid="bid"
                  :is-requester="false"
                />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  </div>
</template>

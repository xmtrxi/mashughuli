<script setup lang="ts">
import type { ApiResponse, ErrandWithRelationships } from "~/types";

const route = useRoute();
console.log(route.params.id);
const { data } = await useApiFetch<ApiResponse<ErrandWithRelationships>>(
  `/api/errands/${route.params.id}`,
);
const errand = ref(data.value?.data);

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

const formattedBudget = `${formatCurrency(errand.value?.budgetMin ?? 0, "Kes")} - ${formatCurrency(errand.value?.budgetMax, "Kes")}`;
</script>
<template>
  <div v-if="!errand"></div>
  <div v-else class="container mx-auto px-4 py-8">
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
            >Due by
            {{ new Date(errand.deadline ?? "").toLocaleDateString() }}</span
          >
        </div>
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:map-marker" class="h-4 w-4" />
          <span>{{ errand.customLocation }}</span>
        </div>
        <div class="flex items-center gap-1 text-muted-foreground">
          <Icon name="mdi:flag" class="h-4 w-4" />
          <span>{{ errand.category.name }}</span>
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
                    {{ errand.bids.length }}
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
                        v-if="errand.requester"
                        :src="errand.requester.avatarUrl"
                        :alt="errand.requester.fullName"
                      />
                      <AvatarFallback>{{
                        errand.requester.fullName.charAt(0)
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="font-medium">
                        {{ errand.requester.fullName }}
                      </div>
                      <div
                        class="flex items-center text-sm text-muted-foreground"
                      >
                        <span class="flex items-center">
                          <Icon
                            v-for="i in 5"
                            :key="i"
                            name="mdi:star"
                            :class="i < 4 ? 'bg-yellow-500' : ''"
                          />
                          <span class="ml-1">{{ "4" }}</span>
                        </span>
                        <span class="mx-2">.</span>
                        <span>4 Errands</span>
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
                  v-for="bid in errand.bids"
                  :key="bid.id"
                  :bid="bid"
                  :is-requester="false"
                />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
      <div>
        <ErrandsBiddingForm
          :errand-id="errand.id"
          :max-budget="100"
          :min-budget="10"
          currency="Kes"
        />
      </div>
    </div>
  </div>
</template>

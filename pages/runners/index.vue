<script setup lang="ts">
import type { User } from "@prisma/client";
import { buttonVariants } from "~/components/ui/button";
import type { ApiResponse } from "~/types";

const { data, pending } =
  await useApiFetch<ApiResponse<User[]>>("/api/users/runners");
const runners = computed(() => data.value?.data ?? []);

const searchQuery = ref("");
const locationFilter = ref("");

const filteredRunners = computed(() => {
  if (!runners.value) return [];
  return runners.value.filter((runner) => {
    const nameMatch = runner.fullName
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    // In a real app, you'd have location data on the user model to filter by
    // const locationMatch = !locationFilter.value || runner.location?.toLowerCase().includes(locationFilter.value.toLowerCase());
    return nameMatch;
  });
});
</script>
<template>
  <div>
    <section
      class="bg-gradient-to-b from-primary-200 to-background py-12 md:py-16"
    >
      <div class="container mx-auto px-4">
        <h1 class="text-3xl md:text-4xl font-bold mb-6">
          Find Reliable Errand Runners
        </h1>
        <p class="text-muted-foreground max-w-3xl mb-8">
          Connect with vetted and reviewed runners ready to help with your
          errands. Filter by location, expertise, and availability to find the
          perfect match for your needs.
        </p>

        <div class="bg-card border rounded-lg p-6 max-w-3xl">
          <div class="flex flex-col md:flex-row gap-4 mb-4">
            <div class="flex-1 relative">
              <Input
                v-model="searchQuery"
                placeholder="Search by name, skill or location"
                class="pl-10"
              />
              <Icon
                name="mdi:search"
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
            </div>
            <Button> Find Runners </Button>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" class="flex gap-1 items-center">
              <Icon name="mdi:map-marker" class="h-3 w-3" />
              <span>Nairobi</span>
            </Button>
            <Button variant="outline" size="sm" class="flex gap-1 items-center">
              <Icon name="mdi:star" class="h-3 w-3" />
              <span>4.5+ Rating</span>
            </Button>
            <Button variant="outline" size="sm" class="flex gap-1 items-center">
              <Icon name="mdi:clock" class="h-3 w-3" />
              <span>Available Now</span>
            </Button>
            <Button variant="outline" size="sm" class="flex gap-1 items-center">
              <Icon name="mdi:filter" class="h-3 w-3" />
              <span>More Filters</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
    <section class="py-12">
      <div class="container mx-auto px-4">
        <Tabs default-value="all" class="mb-8">
          <div class="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All Runners</TabsTrigger>
              <TabsTrigger value="available">Available Now</TabsTrigger>
              <TabsTrigger value="topRated">Top Rated</TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
            </TabsList>
            <p
              v-if="!pending"
              class="text-muted-foreground text-sm hidden md:block"
            >
              Showing <strong>{{ filteredRunners.length }}</strong> runners
            </p>
          </div>
          <div v-if="pending" class="text-center py-10">
            <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
            <p>Loading runners...</p>
          </div>
          <TabsContent
            v-else
            value="all"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <Card
              v-for="runner in filteredRunners"
              :key="runner.id"
              :class="runner.status !== 'active' ? 'opacity-70' : ''"
              class="card-hover"
            >
              <CardHeader class="pb-3">
                <div class="flex justify-between">
                  <div class="flex gap-4 items-center">
                    <Avatar class="w-12 h-12">
                      <AvatarImage
                        :src="runner.avatarUrl!"
                        :alt="runner.fullName"
                      />
                      <AvatarFallback>
                        {{ runner.fullName.charAt(0).toUpperCase() }}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle class="text-lg">{{
                        runner.fullName
                      }}</CardTitle>
                      <CardDescription class="flex items-center">
                        <Icon name="mdi:map-marker" class="h-3 w-3 mr-1" />
                        {{ runner.phoneNumber }}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    :variant="
                      runner.status === 'active' ? 'default' : 'outline'
                    "
                    class="py-0 rounded-2xl"
                  >
                    {{ runner.status === "active" ? "Available" : "Busy" }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {{ runner.bio }}
                </p>
                <div class="flex flex-wrap gap-1 mb-3">
                  <template v-if="runner.categories">
                    <Badge
                      v-for="(cat, index) in Object.keys(
                        runner.categories,
                      ).slice(0, 3)"
                      :key="index"
                      variant="secondary"
                    >
                      {{ cat }}
                    </Badge>
                  </template>
                </div>
              </CardContent>
              <CardFooter>
                <NuxtLink
                  :class="
                    buttonVariants({ variant: 'default', class: 'w-full' })
                  "
                  :to="`/runners/${runner.id}`"
                  >View Profile</NuxtLink
                >
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  </div>
</template>

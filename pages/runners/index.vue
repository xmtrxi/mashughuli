<script setup lang="ts">
const runners = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Nairobi, Kenya",
    bio: "Professional runner with 3+ years of experience. Specialized in shopping and delivery errands.",
    rating: 4.9,
    completedErrands: 124,
    expertise: ["Shopping", "Delivery", "Pick-up"],
    available: true,
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 2,
    name: "Michael Kamau",
    location: "Mombasa, Kenya",
    bio: "Reliable and efficient. I handle administrative tasks and waiting in line so you don't have to.",
    rating: 4.7,
    completedErrands: 89,
    expertise: ["Admin Tasks", "Queuing Services", "Research"],
    available: true,
    image:
      "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 3,
    name: "Amina Wanjiku",
    location: "Nairobi, Kenya",
    bio: "Detail-oriented runner focused on customer satisfaction. I specialize in personal shopping with an eye for quality.",
    rating: 5.0,
    completedErrands: 67,
    expertise: ["Shopping", "Gift Selection", "Personal Assistant"],
    available: true,
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 4,
    name: "Daniel Ochieng",
    location: "Kisumu, Kenya",
    bio: "Quick and efficient service. I'm your go-to person for urgent deliveries and time-sensitive tasks.",
    rating: 4.5,
    completedErrands: 108,
    expertise: ["Urgent Delivery", "Transport", "Courier Service"],
    available: false,
    image:
      "https://images.unsplash.com/photo-1542178243-bc20204b769e?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 5,
    name: "Elizabeth Njeri",
    location: "Nakuru, Kenya",
    bio: "Experienced in handling complex errands. I pride myself on finding solutions to challenging requests.",
    rating: 4.8,
    completedErrands: 73,
    expertise: ["Problem Solving", "Research", "Organization"],
    available: true,
    image:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 6,
    name: "James Maina",
    location: "Nairobi, Kenya",
    bio: "Former logistics professional bringing efficiency to all your errand needs. Specializing in business errands.",
    rating: 4.6,
    completedErrands: 91,
    expertise: ["Business Services", "Document Handling", "Office Tasks"],
    available: true,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100",
  },
];
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
            <p class="text-muted-foreground text-sm hidden md:block">
              Showing <strong>{{ runners.length }}</strong> runners
            </p>
          </div>
          <TabsContent
            value="all"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <Card
              v-for="runner in runners"
              :key="runner.id"
              :class="!runner.available ? 'opacity-70' : ''"
            >
              <CardHeader class="pb-3">
                <div class="flex justify-between">
                  <div class="flex gap-4 items-center">
                    <NuxtImg
                      :src="runner.image"
                      :alt="runner.name"
                      class="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle class="text-lg">{{ runner.name }}</CardTitle>
                      <CardDescription class="flex items-center">
                        <Icon name="mdi:map-marker" class="h-3 w-3 mr-1" />
                        {{ runner.location }}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge class="py-0 rounded-2xl">
                    {{ runner.available ? "Available" : "Busy" }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground mb-4">
                  {{ runner.bio }}
                </p>
                <div class="flex gap-1 mb-3">
                  <Badge v-for="skill in runner.expertise" :key="skill">
                    {{ skill }}
                  </Badge>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="flex items-center">
                    <Icon
                      name="mdi:star"
                      class="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500"
                    />
                    <strong>{{ runner.rating }}</strong
                    >/5.0
                  </span>
                  <span class="flex items-center">
                    <Icon
                      name="mdi:thumbs-up"
                      class="h-4 w-4 text-primary-400 mr-1"
                    />
                    {{ runner.completedErrands }} errands
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button class="w-full">View Profile</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  </div>
</template>

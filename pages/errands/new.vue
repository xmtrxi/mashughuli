<script setup lang="ts">
import { Form, useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { toTypedSchema } from "@vee-validate/zod";
import type { Errand, ErrandCategory } from "@prisma/client";
import type { ApiResponse } from "~/types";
import { createErrandSchema } from "~/shared/schemas/errands.schema";
definePageMeta({
  middleware: ["auth"],
});

const { handleSubmit, isFieldDirty, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(createErrandSchema),
  initialValues: {
    priority: "medium",
    status: "open",
    hasItemsList: false,
  },
});

const isSubmitting = ref(false);
const items = ref([]);

// Computed for estimated total cost
const estimatedTotalCost = computed(() => {
  return items.value.reduce((total, item) => {
    return total + (item.estimatedPrice || 0) * (item.quantity || 1);
  }, 0);
});

// Functions to manage items
function addItem() {
  items.value.push({
    name: '',
    description: '',
    quantity: 1,
    estimatedPrice: null,
    category: '',
    brand: '',
    specifications: '',
    urgent: false,
    notes: '',
  });
}

function removeItem(index) {
  items.value.splice(index, 1);
}

// Watch for hasItemsList changes
watch(() => values.hasItemsList, (newVal) => {
  if (!newVal) {
    items.value = [];
  }
});

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    // Prepare the payload with items if they exist
    const payload = {
      ...values,
      estimatedCost: estimatedTotalCost.value > 0 ? estimatedTotalCost.value : undefined,
      items: values.hasItemsList ? items.value.filter(item => item.name.trim() !== '') : [],
    };
    
    const { data } = await useApiRequest<ApiResponse<Errand>>("/api/errands", {
      body: payload,
      method: "post",
    });
    if (data) {
      toast.success("Errand created successfully");
      await navigateTo("/errands");
    }
  } catch (error: any) {
    toast.error(error.data.message);
  } finally {
    isSubmitting.value = false;
  }
});

const { data: categories } =
  await useApiFetch<ApiResponse<ErrandCategory[]>>("/api/categories");

function handleLocationUpdate(location: { lat: number; lng: number }) {
  setFieldValue("latitude", location.lat);
  setFieldValue("longitude", location.lng);
}
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold">Post a New Errand</h1>
      <p class="text-muted-foreground mt-2 max-w-2xl mx-auto">
        Fill out the form below with details about your errand to connect with
        runners who can help you get it done.
      </p>
    </div>
    <div class="mx-auto max-w-2xl p-6 bg-card rounded-lg border shadow-sm">
      <h2 class="text-2xl font-bold mb-6">Errand Details</h2>

      <form class="grid grid-cols-1 gap-6" @submit.prevent="onSubmit">
        <FormField
          v-slot="{ componentField }"
          name="title"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                placeholder="e.g., Pick up groceries from the supermarket"
              />
            </FormControl>
            <FormDescription>
              A clear, concise title for your errand.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="Detailed description of what needs to be done"
                rows="5"
              />
            </FormControl>
            <FormDescription>
              Be specific about the task, including any lists, sizes, or special
              instructions.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="customLocation">
          <FormItem>
            <FormLabel>Location Description</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                placeholder="e.g., Naivas, Westlands"
              />
            </FormControl>
            <FormDescription>
              Enter a specific address or general area. Then, select the exact
              point on the map below.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div>
          <Label>Pin Location on Map</Label>
          <ClientOnly>
            <MapSelector @update:location="handleLocationUpdate" />
            <template #fallback>
              <div
                class="w-full h-64 bg-muted rounded-lg flex items-center justify-center"
              >
                <p>Loading Map...</p>
              </div>
            </template>
          </ClientOnly>
          <FormField v-slot="{ componentField }" name="latitude"
            ><input type="hidden" v-bind="componentField"
          /></FormField>
          <FormField v-slot="{ componentField }" name="longitude"
            ><input type="hidden" v-bind="componentField"
          /></FormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField v-slot="{ componentField }" name="categoryId">
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="category in categories?.data"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="priority">
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low"> Low Priority </SelectItem>
                  <SelectItem value="medium"> Medium Priority </SelectItem>
                  <SelectItem value="high"> High Priority </SelectItem>
                  <SelectItem value="urgent"> Urgent </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="budgetMin">
            <FormItem>
              <FormLabel>Minimum Budget (KES)</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  min="1"
                  placeholder="e.g., 500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="budgetMax">
            <FormItem>
              <FormLabel>Maximum Budget (KES)</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  min="1"
                  placeholder="e.g., 1500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="deadline">
          <FormItem>
            <FormLabel>Deadline</FormLabel>
            <FormControl>
              <Input type="datetime-local" v-bind="componentField" />
            </FormControl>
            <FormDescription
              >When does this errand need to be completed by?</FormDescription
            >
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Items List Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Items Needed (Optional)</h3>
            <FormField v-slot="{ componentField }" name="hasItemsList">
              <FormItem class="flex items-center space-x-2">
                <FormControl>
                  <input type="checkbox" v-bind="componentField" class="rounded" />
                </FormControl>
                <FormLabel class="text-sm font-normal">This errand requires specific items</FormLabel>
              </FormItem>
            </FormField>
          </div>
          
          <div v-if="values.hasItemsList" class="space-y-4 p-4 border rounded-lg bg-muted/30">
            <FormField v-slot="{ componentField }" name="shopName">
              <FormItem>
                <FormLabel>Shop/Store Name (Optional)</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" placeholder="e.g., Carrefour, Nakumatt, Local Store" />
                </FormControl>
                <FormDescription>Where should the items be purchased from?</FormDescription>
              </FormItem>
            </FormField>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <Label>Items List</Label>
                <Button type="button" variant="outline" size="sm" @click="addItem">
                  <Icon name="mdi:plus" class="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div v-if="items.length === 0" class="text-center py-4 text-muted-foreground">
                <p>No items added yet. Click "Add Item" to get started.</p>
              </div>
              
              <div v-for="(item, index) in items" :key="index" class="border rounded-lg p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium">Item {{ index + 1 }}</h4>
                  <Button type="button" variant="ghost" size="sm" @click="removeItem(index)">
                    <Icon name="mdi:delete" class="h-4 w-4" />
                  </Button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Item Name *</Label>
                    <Input v-model="item.name" placeholder="e.g., Milk, Bread, etc." required />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input v-model.number="item.quantity" type="number" min="1" placeholder="1" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input v-model="item.category" placeholder="e.g., Food, Electronics" />
                  </div>
                  <div>
                    <Label>Brand (Optional)</Label>
                    <Input v-model="item.brand" placeholder="e.g., Brookside, Samsung" />
                  </div>
                  <div>
                    <Label>Estimated Price (KES)</Label>
                    <Input v-model.number="item.estimatedPrice" type="number" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div class="flex items-center space-x-2">
                    <input v-model="item.urgent" type="checkbox" class="rounded" />
                    <Label class="text-sm font-normal">Mark as urgent</Label>
                  </div>
                </div>
                
                <div>
                  <Label>Description/Specifications</Label>
                  <Textarea v-model="item.description" placeholder="Size, color, specific requirements..." rows="2" />
                </div>
                
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea v-model="item.notes" placeholder="Any special instructions..." rows="2" />
                </div>
              </div>
              
              <div v-if="estimatedTotalCost > 0" class="mt-4 p-3 bg-muted rounded-lg">
                <div class="flex justify-between items-center text-sm">
                  <span class="font-medium">Estimated Total Cost:</span>
                  <span class="font-bold">{{ formatCurrency(estimatedTotalCost, 'KES') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" :disabled="isSubmitting" class="w-full">
          <Icon
            v-if="isSubmitting"
            name="mdi:loading"
            class="animate-spin mr-2"
          />
          {{ isSubmitting ? "Posting..." : "Post Errand" }}
        </Button>
      </form>
    </div>
  </div>
</template>

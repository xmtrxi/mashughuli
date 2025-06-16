<script setup lang="ts">
import type { ErrandCategory } from "@prisma/client";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { z } from "zod";
import {
  createErrandCategorySchema,
  updateErrandCategorySchema,
} from "~/shared/schemas/category.schema";
import type { ApiResponse } from "~/types";

// Reactive state
const categories = ref<ErrandCategory[]>([]);
const loading = ref(false);
const editingCategory = ref<ErrandCategory | null>(null);
const isDialogOpen = ref(false);
const isEditMode = computed(() => !!editingCategory.value);

// Form for debugging and manual field setting
const form = useForm({
  validationSchema: toTypedSchema(createErrandCategorySchema),
});

// MDI Icons list for selection
const availableIcons = [
  { value: "mdi:home", label: "Home" },
  { value: "mdi:shopping-cart", label: "Shopping" },
  { value: "mdi:car", label: "Transportation" },
  { value: "mdi:medical-bag", label: "Medical" },
  { value: "mdi:school", label: "Education" },
  { value: "mdi:briefcase", label: "Work" },
  { value: "mdi:food", label: "Food" },
  { value: "mdi:gift", label: "Gift" },
  { value: "mdi:wrench", label: "Maintenance" },
  { value: "mdi:phone", label: "Communication" },
  { value: "mdi:calendar", label: "Events" },
  { value: "mdi:heart", label: "Personal" },
];

// Fetch categories
const fetchCategories = async () => {
  try {
    loading.value = true;
    const { data } = await useApiFetch<ApiResponse<ErrandCategory[]>>(
      "/api/categories",
      {
        method: "get",
      },
    );
    if (data) {
      categories.value = data.value?.data || [];
    }
  } catch (e: any) {
    toast.error(e.data?.message || "Failed to fetch categories");
  } finally {
    loading.value = false;
  }
};

// Create category
const submitCategory = async (
  values: z.infer<typeof createErrandCategorySchema>,
) => {
  try {
    const { data } = await useApiRequest<ApiResponse<ErrandCategory>>(
      "/api/categories",
      {
        method: "post",
        body: values,
      },
    );
    if (data) {
      toast.success("Category created successfully");
      closeDialog();
      await fetchCategories();
    }
  } catch (e: any) {
    toast.error(e.data?.message || "An error occurred");
  }
};

// Update category
const updateCategory = async (
  values: z.infer<typeof updateErrandCategorySchema>,
) => {
  try {
    if (!editingCategory.value) return;

    const updateData = { ...values, id: editingCategory.value.id };
    const { data } = await useApiRequest<ApiResponse<ErrandCategory>>(
      `/api/categories/${editingCategory.value.id}`,
      {
        method: "put",
        body: updateData,
      },
    );
    if (data) {
      toast.success("Category updated successfully");
      closeDialog();
      await fetchCategories();
    }
  } catch (e: any) {
    toast.error(e.data?.message || "An error occurred");
  }
};

// Handle form submission (create or update)
const handleSubmit = (values: any) => {
  if (isEditMode.value) {
    updateCategory(values);
  } else {
    submitCategory(values);
  }
};

// Delete category
const deleteCategory = async (id: string) => {
  if (!confirm("Are you sure you want to delete this category?")) {
    return;
  }

  try {
    await useApiRequest(`/api/categories/${id}`, {
      method: "delete",
    });
    toast.success("Category deleted successfully");
    await fetchCategories();
  } catch (e: any) {
    toast.error(e.data?.message || "Failed to delete category");
  }
};

// Open dialog for creating
const openCreateDialog = () => {
  editingCategory.value = null;
  isDialogOpen.value = true;
};

// Open dialog for editing
const openEditDialog = (category: ErrandCategory) => {
  editingCategory.value = category;

  // Set form values for debugging/manual handling if needed
  form.setFieldValue("name", category.name);
  form.setFieldValue("description", category.description || "");
  form.setFieldValue("iconName", category.iconName || "");
  form.setFieldValue("active", category.active);

  isDialogOpen.value = true;
};

// Close dialog and reset
const closeDialog = () => {
  isDialogOpen.value = false;
  editingCategory.value = null;
  form.resetForm();
};

// Format date
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
fetchCategories();
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Categories</h2>
        <p class="text-muted-foreground">Manage errand categories</p>
      </div>
    </div>

    <!-- Create Category Button -->
    <div>
      <Button @click="openCreateDialog">
        <Icon name="mdi:plus" class="w-4 h-4 mr-2" />
        Create Category
      </Button>
    </div>

    <!-- Single Dialog for Create/Edit -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{
            isEditMode ? "Edit Category" : "Create Category"
          }}</DialogTitle>
          <DialogDescription>
            {{
              isEditMode
                ? "Update category information"
                : "Create a new category for errands"
            }}
          </DialogDescription>
        </DialogHeader>

        <AutoForm
          :key="isEditMode ? editingCategory?.id : 'create'"
          class="w-full space-y-6"
          :form="form"
          :field-config="{
            description: {
              component: 'textarea',
              label: 'Description',
            },
            active: {
              label: 'Category Status',
            },
            id: {
              inputProps: {
                type: 'hidden',
              },
              hideLabel: true,
            },
          }"
          :schema="
            isEditMode ? updateErrandCategorySchema : createErrandCategorySchema
          "
          @submit="handleSubmit"
        >
          <div class="flex justify-end space-x-2">
            <Button type="button" variant="outline" @click="closeDialog">
              Cancel
            </Button>
            <Button type="submit">
              {{ isEditMode ? "Update Category" : "Create Category" }}
            </Button>
          </div>
        </AutoForm>
      </DialogContent>
    </Dialog>

    <!-- Categories List -->
    <div class="space-y-4">
      <div v-if="loading" class="flex justify-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        ></div>
      </div>

      <div v-else-if="categories.length === 0" class="text-center py-8">
        <p class="text-muted-foreground">No categories found</p>
        <p class="text-sm text-muted-foreground mt-2">
          Create your first category to get started
        </p>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          v-for="category in categories"
          :key="category.id"
          class="relative"
        >
          <CardHeader class="pb-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div
                  v-if="category.iconName"
                  class="p-2 bg-primary/10 rounded-lg"
                >
                  <Icon
                    :name="category.iconName"
                    class="w-5 h-5 text-primary"
                  />
                </div>
                <div>
                  <CardTitle class="text-lg">{{ category.name }}</CardTitle>
                  <Badge
                    :variant="category.active ? 'default' : 'secondary'"
                    class="mt-1"
                  >
                    {{ category.active ? "Active" : "Inactive" }}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm">
                    <Icon name="mdi:dots-vertical" class="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openEditDialog(category)">
                    <Icon name="mdi:pencil" class="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @click="deleteCategory(category.id)"
                    class="text-destructive"
                  >
                    <Icon name="mdi:delete" class="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <p
              v-if="category.description"
              class="text-sm text-muted-foreground mb-4"
            >
              {{ category.description }}
            </p>
            <div class="text-xs text-muted-foreground">
              <p>Created: {{ formatDate(category.createdAt) }}</p>
              <p v-if="category.updatedAt !== category.createdAt">
                Updated: {{ formatDate(category.updatedAt) }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

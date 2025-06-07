<script setup lang="ts">
import type { User } from "@prisma/client";
import type { ApiResponse } from "~/types";
import { format } from "date-fns";

definePageMeta({ layout: "admin" });

const {
  data: response,
  pending,
  refresh,
} = await useApiFetch<ApiResponse<User[]>>("/api/admin/users");
const users = computed(() => response.value?.data ?? []);

const statusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "suspended":
      return "destructive";
    case "inactive":
      return "secondary";
    default:
      return "outline";
  }
};
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-3xl font-bold tracking-tight">User Management</h2>
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription
          >View and manage all registered users on the
          platform.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div v-if="pending" class="text-center py-10">
          <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined On</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell>
                <div class="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage :src="user.avatarUrl!" :alt="user.fullName" />
                    <AvatarFallback>{{
                      user.fullName.charAt(0)
                    }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div class="font-medium">{{ user.fullName }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell class="capitalize">{{ user.primaryRole }}</TableCell>
              <TableCell>
                <Badge :variant="statusVariant(user.status)">{{
                  user.status
                }}</Badge>
              </TableCell>
              <TableCell>{{
                format(new Date(user.createdAt), "MMM dd, yyyy")
              }}</TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                      <Icon name="mdi:dots-horizontal" class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Suspend User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

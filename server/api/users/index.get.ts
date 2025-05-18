import { userService } from "~/server/services/users.service";

export default defineEventHandler(async () => {
  const { getUsers } = userService();
  const users = await getUsers();
  return {
    success: true,
    data: users,
  };
});

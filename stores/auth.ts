import type { User } from "@prisma/client";
import { toast } from "vue-sonner";
import type { ApiResponse } from "~/types";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const loading = ref<boolean>(false);
    const route = useRoute();

    const login = async (values: any) => {
      loading.value = true;
      try {
        const { data, token: authToken } = await useApiRequest<
          ApiResponse<User>
        >("/api/auth/login", {
          method: "POST",
          body: values,
        });
        if (data) {
          token.value = authToken ? authToken : null;
          user.value = data;
          toast.success("Login Success");

          if (route.query.redirect) {
            await navigateTo(`${route.query.redirect}`);
          } else {
            await navigateTo("/dashboard");
          }
        }
      } catch (error: any) {
        // Show the most relevant error message to the user
        toast.error(error.data?.message || "An unknown error occurred");
      } finally {
        loading.value = false;
      }
    };

    const logout = async () => {
      user.value = null;
      token.value = null;
      await navigateTo("/");
    };

    return {
      user,
      token,
      loading,

      login,
      logout,
    };
  },
  {
    persist: true,
  },
);

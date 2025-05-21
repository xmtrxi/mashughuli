import type { User } from "@prisma/client";
import { toast } from "vue-sonner";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const loading = ref<boolean>(false);
    const router = useRouter();

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
          router.push("/dashboard");
        }
      } catch (error: any) {
        // Show the most relevant error message to the user
        toast.error(error.data?.message || "An unknown error occurred");
      } finally {
        loading.value = false;
      }
    };

    return {
      user,
      token,
      loading,

      login,
    };
  },
  {
    persist: true,
  },
);

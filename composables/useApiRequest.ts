export async function useApiRequest<T>(url: string, options: any = {}) {
  const authStore = useAuthStore();
  const token = authStore.token;
  const headers: Record<string, string> = {
    ...options.headers,
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return await $fetch<T>(url, {
    ...options,
    headers,
  });
}

export async function useApiFetch<T>(url: string, options: any = {}) {
  const token = useCookie("auth_token");
  const headers: Record<string, string> = {
    ...options.headers,
    "Content-Type": "application/json",
  };
  if (token.value) {
    headers["Authorization"] = `Bearer ${token.value}`;
  }

  return await useFetch<T>(url, {
    ...options,
    headers,
  });
}

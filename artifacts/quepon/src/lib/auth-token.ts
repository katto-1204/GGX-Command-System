import { getGetCurrentUserQueryKey, setAuthTokenGetter, type User } from "@workspace/api-client-react";
import type { QueryClient } from "@tanstack/react-query";

const tokenKey = "quepon_token";

export function initializeAuthToken() {
  setAuthTokenGetter(() => localStorage.getItem(tokenKey));
}

export function persistAuthenticatedUser(queryClient: QueryClient, token: string, user: User) {
  localStorage.setItem(tokenKey, token);
  initializeAuthToken();
  queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
}

export function clearAuthenticatedUser(queryClient?: QueryClient) {
  localStorage.removeItem(tokenKey);
  initializeAuthToken();
  queryClient?.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
}

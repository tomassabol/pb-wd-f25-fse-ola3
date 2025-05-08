import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi, type LoginResponse } from "../service/auth-api";
import { useAuth } from "../store/auth";

type LoginCredentials = {
  email: string;
  password: string;
};

export function useAuthQuery() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const loginMutation = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: ({ email, password }) => authApi.login({ email, password }),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });

  const signupMutation = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: ({ email, password }) => authApi.signup({ email, password }),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      if (!token) throw new Error("No token available");
      return authApi.getMe(token);
    },
    enabled: !!token,
    initialData: user ?? undefined,
  });

  return {
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    user: userQuery.data,
    isLoading:
      loginMutation.isPending ||
      signupMutation.isPending ||
      userQuery.isLoading,
    error: loginMutation.error ?? signupMutation.error ?? userQuery.error,
  };
}

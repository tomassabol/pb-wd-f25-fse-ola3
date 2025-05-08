import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useAuth } from "~/store/auth";

import type { Category } from "../../../server/src/db/schema";
import { apiClient } from "../api-client";

// Query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
} as const;

// API functions
const getCategoryById = async ({
  id,
  token,
}: {
  id: string;
  token: string;
}) => {
  const { data } = await apiClient(token).get<Category>(`/v1/categories/${id}`);
  return data;
};

const getCategories = async ({ token }: { token: string }) => {
  const { data } = await apiClient(token).get<{
    total: number;
    categories: Array<Category>;
  }>("/v1/categories");
  return data;
};

const createCategory = async ({
  category,
  token,
}: {
  category: Pick<Category, "name">;
  token: string;
}) => {
  const { data } = await apiClient(token).post<Category>(
    "/v1/categories",
    category
  );
  return data;
};

const updateCategory = async ({
  category,
  token,
}: {
  category: Pick<Category, "name" | "id">;
  token: string;
}) => {
  const { data } = await apiClient(token).put<Category>(
    `/v1/categories/${category.id}`,
    category
  );
  return data;
};

const deleteCategory = async ({ id, token }: { id: string; token: string }) => {
  await apiClient(token).delete(`/v1/categories/${id}`);
};

// Hooks
export function useCategory(id: string) {
  const { token } = useAuth();
  return useSuspenseQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return getCategoryById({ id, token });
    },
  });
}

export function useCategories() {
  const { token } = useAuth();
  return useSuspenseQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return getCategories({ token });
    },
  });
}

export function useCreateCategory() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: Pick<Category, "name">) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return createCategory({ category, token });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (category: Pick<Category, "name" | "id">) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return updateCategory({ category, token });
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return deleteCategory({ id, token });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useAuth } from "~/store/auth";

import type { Category, Entry } from "../../../server/src/db/schema";
import { apiClient } from "../api-client";

// Query keys
export const entryKeys = {
  all: ["entries"] as const,
  lists: () => [...entryKeys.all, "list"] as const,
  list: (filters: string) => [...entryKeys.lists(), { filters }] as const,
  details: () => [...entryKeys.all, "detail"] as const,
  detail: (id: string) => [...entryKeys.details(), id] as const,
  byCategory: () => [...entryKeys.all, "byCategory"] as const,
  byCategoryId: (id: string) => [...entryKeys.byCategory(), id] as const,
};

// API functions
const getEntryById = async ({ id, token }: { id: string; token: string }) => {
  const { data } = await apiClient(token).get<Entry & { category: Category }>(
    `/v1/entries/${id}`
  );
  return data;
};

const getEntries = async ({ token }: { token: string }) => {
  const { data } = await apiClient(token).get<{
    total: number;
    entries: Array<Entry>;
  }>("/v1/entries");
  return data;
};

const getEntriesByCategory = async ({ token }: { token: string }) => {
  const { data } = await apiClient(token).get<{
    total: number;
    entries: Record<string, Array<Entry>>;
  }>("/v1/entries", {
    params: { sortByCategory: true },
  });
  return data;
};

const getEntriesByCategoryId = async ({
  id,
  token,
}: {
  id: string;
  token: string;
}) => {
  const { data } = await apiClient(token).get<{
    total: number;
    entries: Array<Entry>;
  }>("/v1/entries", {
    params: { categoryId: id },
  });
  return data;
};

const createEntry = async ({
  entry,
  token,
}: {
  entry: Pick<Entry, "name" | "categoryId" | "description">;
  token: string;
}) => {
  const { data } = await apiClient(token).post<Entry>("/v1/entries", entry);
  return data;
};

const updateEntry = async ({
  entry,
  token,
}: {
  entry: Pick<Entry, "id" | "name" | "categoryId" | "description">;
  token: string;
}) => {
  const { data } = await apiClient(token).put<Entry>(
    `/v1/entries/${entry.id}`,
    entry
  );
  return data;
};

const deleteEntry = async ({ id, token }: { id: string; token: string }) => {
  await apiClient(token).delete(`/v1/entries/${id}`);
};

// Hooks
export function useEntry(id: string) {
  const { token } = useAuth();
  return useSuspenseQuery({
    queryKey: entryKeys.detail(id),
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return getEntryById({ id, token });
    },
  });
}

export function useEntries() {
  const { token } = useAuth();
  return useSuspenseQuery({
    queryKey: entryKeys.lists(),
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return getEntries({ token });
    },
  });
}

export function useEntriesByCategory() {
  const { token } = useAuth();
  return useSuspenseQuery({
    queryKey: entryKeys.byCategory(),
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return getEntriesByCategory({ token });
    },
  });
}

export function useEntriesByCategoryId(id: string) {
  const { token } = useAuth();
  return useSuspenseQuery({
    queryKey: entryKeys.byCategoryId(id),
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return getEntriesByCategoryId({ id, token });
    },
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (entry: Pick<Entry, "name" | "categoryId" | "description">) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return createEntry({ entry, token });
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: entryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: entryKeys.byCategory() });
      if (data.categoryId) {
        void queryClient.invalidateQueries({
          queryKey: entryKeys.byCategoryId(data.categoryId),
        });
      }
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (
      entry: Pick<Entry, "id" | "name" | "categoryId" | "description">
    ) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return updateEntry({ entry, token });
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: entryKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: entryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: entryKeys.byCategory() });
      if (data.categoryId) {
        void queryClient.invalidateQueries({
          queryKey: entryKeys.byCategoryId(data.categoryId),
        });
      }
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return deleteEntry({ id, token });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: entryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: entryKeys.byCategory() });
    },
  });
}

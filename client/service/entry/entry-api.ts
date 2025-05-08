import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { env } from "~/env";
import { getApiUrl } from "~/util/url";

import type { Category, Entry } from "../../../server/src/db/schema";

export const entryApi = createApi({
  reducerPath: "entryApi",
  tagTypes: [
    "Entry",
    "EntryList",
    "EntryByCategory",
    "Category",
    "CategoryList",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      headers.set("x-api-key", env.EXPO_PUBLIC_API_KEY);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getEntryById: builder.query<Entry & { category: Category }, string>({
      query: (id) => ({
        url: `/v1/entry/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Entry", id }],
    }),

    getEntries: builder.query<{ total: number; entries: Array<Entry> }, void>({
      query: () => ({
        url: "/v1/entry",
        method: "GET",
      }),
      providesTags: ["EntryList"],
    }),

    getEntriesByCategory: builder.query<
      { total: number; entries: Record<string, Array<Entry>> },
      void
    >({
      query: () => ({
        url: "/v1/entry",
        method: "GET",
        params: {
          sortByCategory: true,
        },
      }),
      providesTags: ["EntryByCategory"],
    }),

    getEntriesByCategoryId: builder.query<
      { total: number; entries: Array<Entry> },
      string
    >({
      query: (id) => ({
        url: `/v1/entry`,
        method: "GET",
        params: {
          categoryId: id,
        },
      }),
      providesTags: (result, error, id) => [{ type: "EntryByCategory", id }],
    }),

    createEntry: builder.mutation<
      Entry,
      Pick<Entry, "name" | "categoryId" | "description">
    >({
      query: (entry) => ({
        url: "/v1/entry",
        method: "POST",
        body: entry,
      }),
      invalidatesTags: (result) => [
        "EntryList",
        "EntryByCategory",
        ...(result?.categoryId
          ? [{ type: "EntryByCategory" as const, id: result.categoryId }]
          : []),
      ],
    }),

    updateEntry: builder.mutation<
      Entry,
      Pick<Entry, "id" | "name" | "categoryId" | "description">
    >({
      query: ({ id, ...entry }) => ({
        url: `/v1/entry/${id}`,
        method: "PUT",
        body: entry,
      }),
      invalidatesTags: (result, error, { id, categoryId }) => [
        { type: "Entry", id },
        "EntryList",
        "EntryByCategory",
        ...(categoryId
          ? [{ type: "EntryByCategory" as const, id: categoryId }]
          : []),
      ],
    }),

    deleteEntry: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/entry/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EntryList", "EntryByCategory"],
    }),
  }),
});

export const {
  useGetEntriesQuery,
  useLazyGetEntriesQuery,
  useGetEntriesByCategoryQuery,
  useLazyGetEntriesByCategoryQuery,
  useGetEntryByIdQuery,
  useLazyGetEntryByIdQuery,
  useGetEntriesByCategoryIdQuery,
  useLazyGetEntriesByCategoryIdQuery,
  useCreateEntryMutation,
  useDeleteEntryMutation,
  useUpdateEntryMutation,
} = entryApi;

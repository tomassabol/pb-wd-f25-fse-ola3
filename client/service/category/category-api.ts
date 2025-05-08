import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { env } from "~/env";
import { getApiUrl } from "~/util/url";

import type { Category } from "../../../server/src/db/schema";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  tagTypes: [
    "Category",
    "CategoryList",
    "Entry",
    "EntryList",
    "EntryByCategory",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      headers.set("x-api-key", env.EXPO_PUBLIC_API_KEY);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCategoryById: builder.query<Category, string>({
      query: (id) => ({
        url: `v1/category/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    getCategories: builder.query<
      { total: number; categories: Array<Category & { entryCount: number }> },
      void
    >({
      query: () => ({
        url: "v1/category",
        method: "GET",
      }),
      providesTags: ["CategoryList"],
    }),

    createCategory: builder.mutation<Category, Pick<Category, "name">>({
      query: (category) => ({
        url: "v1/category",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["CategoryList", "EntryByCategory"],
    }),

    updateCategory: builder.mutation<Category, Pick<Category, "id" | "name">>({
      query: ({ id, ...category }) => ({
        url: `v1/category/${id}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        "CategoryList",
        "EntryByCategory",
        { type: "EntryByCategory", id },
      ],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `v1/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Category", id },
        "CategoryList",
        "EntryList",
        "EntryByCategory",
        { type: "EntryByCategory", id },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetCategoryByIdQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} = categoryApi;

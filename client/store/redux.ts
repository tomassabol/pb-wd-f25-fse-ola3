import { configureStore } from "@reduxjs/toolkit";

import { categoryApi } from "~/service/category/category-api";
import { entryApi } from "~/service/entry/entry-api";

export const store = configureStore({
  reducer: {
    [entryApi.reducerPath]: entryApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(entryApi.middleware, categoryApi.middleware),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

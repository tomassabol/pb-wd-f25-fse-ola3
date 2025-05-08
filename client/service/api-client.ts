import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

import { env } from "~/env";
import { getApiUrl } from "~/util/url";

export const apiClient = (token: string) =>
  axios.create({
    baseURL: getApiUrl(),
    headers: {
      "x-api-key": env.EXPO_PUBLIC_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

export const queryClient = new QueryClient();

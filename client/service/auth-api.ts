import axios from "axios";

import { API_URL } from "../env";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export type User = {
  id: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type ErrorResponse = {
  error: string;
};

export const authApi = {
  login: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/v1/auth/login", {
      email,
      password,
    });
    return data;
  },

  signup: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    await api.post("/v1/auth/register", {
      email,
      password,
    });

    // After successful signup, automatically log in
    const { data } = await api.post<LoginResponse>("/v1/auth/login", {
      email,
      password,
    });
    return data;
  },

  getMe: async (token: string): Promise<User> => {
    const { data } = await api.get<User>("/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
};

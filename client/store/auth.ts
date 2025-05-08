import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authApi, type User } from "../service/auth-api";

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  signup: (params: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => {
        try {
          const data = await authApi.login({ email, password });
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
          });
        } catch {
          throw new Error("Login failed");
        }
      },

      signup: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => {
        try {
          const data = await authApi.signup({ email, password });
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
          });
        } catch {
          throw new Error("Signup failed");
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

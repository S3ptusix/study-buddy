import { create } from "zustand";

type User = {
    displayName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
};

type Store = {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const store = create<Store>((set) => ({
    user: null,

    setUser: (user) => set({ user }),

    clearUser: () => set({ user: null }),
}));
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/auth.service";
import { store } from "@/utils/store";

export function useLogout(navigateTo: string) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const clearUser = store((state) => state.clearUser);

    const logoutMutation = useMutation({
        mutationFn: logout,

        onSuccess: () => {
            // Clear Zustand
            clearUser();

            // Clear cached user
            queryClient.removeQueries({
                queryKey: ["user"],
            });

            // Redirect
            navigate(navigateTo, {
                replace: true,
            });
        },

        onError: (error) => {
            console.error("Logout failed:", error);
        },
    });

    return {
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
    };
}
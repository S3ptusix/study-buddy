import { useQuery } from "@tanstack/react-query";
import { getResetMe } from "@/services/auth.service";

export function useResetMe() {
    return useQuery({
        queryKey: ["user-reset"],
        queryFn: getResetMe,
        retry: false,
        refetchOnWindowFocus: false,
    });
}
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/auth.service";

export function useMe() {
    return useQuery({
        queryKey: ["user"],
        queryFn: getMe,
        retry: false,
        refetchOnWindowFocus: false,
    });
}
import { getResetMe } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";

export default function ResetRoute() {
    const {
        data: user,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["reset-user"],
        queryFn: getResetMe,
        retry: false,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError || !user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
import { Navigate, Outlet } from "react-router-dom";
import { store } from "@/utils/store";

export default function GuestRoute() {
    const user = store((state) => state.user);

    if (user) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
}
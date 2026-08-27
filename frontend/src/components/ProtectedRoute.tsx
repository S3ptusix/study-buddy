import { Navigate, Outlet } from "react-router-dom";
import { store } from "@/utils/store";

export default function ProtectedRoute() {
    const user = store((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
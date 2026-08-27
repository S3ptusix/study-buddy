import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

export default function Dashboard() {
    const {
        logout,
        isLoggingOut,
    } = useLogout('/login');

    return (
        <div>
            <p>Dashboard</p>

            <Button
                onClick={() => logout()}
                disabled={isLoggingOut}
            >
                {isLoggingOut
                    ? "Logging out..."
                    : "Log out"}
            </Button>
        </div>
    );
}
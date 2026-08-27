import { useEffect } from "react";
import { useMe } from "../hooks/useMe";
import { store } from "@/utils/store";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: user, isLoading } = useMe();

    const setUser = store((state) => state.setUser);

    useEffect(() => {
        setUser(user ?? null);
    }, [user, setUser]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return children;
}
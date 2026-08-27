import { Button } from "./ui/button";
import studyBuddyIcon from "../assets/study-buddy-icon.svg"
import { useNavigate } from "react-router-dom";

export default function NavBar() {

    const navigate = useNavigate();

    const items = [
        {
            path: "feature",
            name: "Features",
        },
        {
            path: "how-it-works",
            name: "How it works",
        },
        {
            path: "student",
            name: "Student",
        },
        {
            path: "teacher",
            name: "Teacher",
        },
    ];

    return (
        <nav className="flex justify-between items-center py-4 border-b px-[5vw]">
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
            >
                <div className="h-12 aspect-square">
                    <img
                        src={studyBuddyIcon}
                        className="h-full w-full dark:invert-0"
                    />
                </div>
                <p className="font-semibold max-sm:hidden">
                    StudyBuddy
                </p>
            </div>
            <div className="space-x-4 font-light text-sm max-md:hidden">
                {items.map((item, index) => (
                    <a
                        key={index}
                        href={`#${item.path}`}
                    >
                        {item.name}
                    </a>
                ))}
            </div>

            <div className="space-x-2">
                <Button variant="ghost"
                    onClick={() => navigate('/login')}
                >
                    Log in
                </Button>
                <Button
                    onClick={() => navigate('/register')}
                >
                    Get Started
                </Button>
            </div>
        </nav>
    )
}
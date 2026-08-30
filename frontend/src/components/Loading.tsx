import logoAnimation from "../assets/study-buddy-logo-animated.svg";
import logoAnimationDark from "../assets/study-buddy-logo-animated-dark.svg";

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            {/* Light mode */}
            <img
                src={logoAnimation}
                alt="StudyBuddy"
                className="hidden dark:block"
            />

            {/* Dark mode */}
            <img
                src={logoAnimationDark}
                alt="StudyBuddy"
                className="block dark:hidden"
            />
        </div>
    );
}
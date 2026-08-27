import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Landing() {

    const navigate = useNavigate();

    return (
        <div>
            <NavBar />
            <section className="px-[15vw] py-20 space-y-16 flex flex-col items-center bg-muted">
                <p>
                    ✦ AI-Powered Learning Platform
                </p>

                <p className="text-3xl lg:text-5xl font-semibold">
                    Learn. Create. Share.
                </p>

                <p className="max-w-150 text-center text-muted-foreground">
                    An AI-powered social learning platform where students and teachers create, share, and practice knowledge together.
                </p>

                <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                >
                    Get Started — it's free
                </Button>

                <Card className="w-full">

                </Card>

            </section>
            <section id="feature" className="h-screen px-[5vw]">
                <h1>feature</h1>
            </section>

            <section id="how-it-works" className="h-screen px-[5vw] bg-muted">
                <h1>How it Works</h1>
            </section>

            <section className="h-screen px-[5vw]">
                <div id="student">
                    <h1>Student</h1>
                </div>
                <div id="teacher">
                    <h1>Teacher</h1>
                </div>
            </section>
        </div>
    )
}
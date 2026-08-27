import { Link, useNavigate } from "react-router-dom"
import studyBuddyIcon from "../assets/study-buddy-icon.svg"
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, login as loginUser } from "@/services/auth.service"
import { toast } from "@/components/ui/toast";
import axios from "axios";
import { store } from "@/utils/store";

const formSchema = z
    .object({
        credential: z
            .string()
            .min(1, "Email or username is required."),

        password: z
            .string()
            .min(1, "Password is required."),
    })

export type LoginFields = z.infer<typeof formSchema>

export default function Login() {

    const queryClient = useQueryClient();
    const setUser = store((state) => state.setUser);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFields>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            credential: "",
            password: "",
        },
    })

    type ApiError = {
        message: string;
        errors?: Record<string, string>;
    };

    const loginMutation = useMutation({
        mutationFn: loginUser,

        onSuccess: async () => {
            const user = await queryClient.fetchQuery({
                queryKey: ["user"],
                queryFn: getMe,
            });

            setUser(user);

            navigate("/app/dashboard");
        },

        onError: (error) => {
            if (axios.isAxiosError<ApiError>(error)) {
                const message = error.response?.data.message;

                toast.add({
                    type: "error",
                    title: "Registration failed",
                    description: message ?? "Something went wrong. Please try again.",
                })

                console.log("Errors:", error.response?.data.errors);

            } else {
                console.error("Unexpected error:", error);
            }
        },
    });

    const onSubmit: SubmitHandler<LoginFields> = (data) => {
        loginMutation.mutate(data)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-muted">

            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
            >
                <div className="h-12 aspect-square">
                    <img
                        src={studyBuddyIcon}
                        className="h-full w-full"
                    />
                </div>
                <p className="font-semibold">
                    StudyBuddy
                </p>
            </div>

            <div className="text-center">
                <p className="text-xl font-semibold">Create your account</p>

                <p className="text-sm text-muted-foreground">Join thousands of learners on StudyBuddy</p>
            </div>

            <Card className="w-full max-w-sm">
                <CardContent>
                    <form
                        id="login-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="flex flex-col gap-6">
                            <Field data-invalid={!!errors.credential}>
                                <FieldLabel htmlFor="credential">Email or username</FieldLabel>
                                <Input
                                    {...register("credential")}
                                    id="credential"
                                    type="text"
                                    placeholder="you@email.com or jahleelcasintahan"
                                    aria-invalid={!!errors.credential}
                                />
                                {errors.credential && (
                                    <FieldError>
                                        {errors.credential.message}
                                    </FieldError>
                                )}
                            </Field>
                            <Field data-invalid={!!errors.password}>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    {...register("password")}
                                    id="password"
                                    type="password"
                                    placeholder="●●●●●●●●"
                                    aria-invalid={!!errors.password}
                                />
                                {errors.password && (
                                    <FieldError>
                                        {errors.password.message}
                                    </FieldError>
                                )}
                                <p className="text-xs cursor-pointer hover:underline">Forgot password?</p>
                            </Field>


                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        form="login-form"
                        className="w-full"
                    >
                        Log in
                    </Button>
                </CardFooter>
            </Card>
            <p className="text-sm text-muted-foreground">
                Don't have an account? <Link to="/register" className="text-foreground">Sign up</Link>
            </p>
        </div>
    )
}
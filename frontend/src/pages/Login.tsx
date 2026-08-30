import { Link, useNavigate } from "react-router-dom"
import studyBuddyIcon from "../assets/study-buddy-icon.svg"
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
import type { ApiError } from "@/types/error";
import { useState } from "react";
import VerifyEmail from "@/components/VerifyEmail";
import ForgotPassword from "@/components/ForgotPassword";

const loginFields = z
    .object({
        credential: z
            .string()
            .min(1, "Email or username is required."),

        password: z
            .string()
            .min(1, "Password is required."),
    })

export type LoginFields = z.infer<typeof loginFields>

export default function Login() {

    const queryClient = useQueryClient();
    const setUser = store((state) => state.setUser);

    const navigate = useNavigate();

    const [openVerifyEmail, setOpenVerifyEmail] = useState(false);
    const [openForgotPassword, setOpenForgotPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFields>({
        resolver: zodResolver(loginFields),
        defaultValues: {
            credential: "",
            password: "",
        },
    })

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

                const err = error.response?.data;

                if (err?.code && err?.code === "EMAIL_NOT_VERIFIED") {
                    return setOpenVerifyEmail(true);
                }

                toast.add({
                    type: "error",
                    title: "Registration failed",
                    description: err?.message ?? "Something went wrong. Please try again.",
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
        <>
            <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-[5vw] py-20">

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

                <div className="w-full max-w-sm">
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
                                <p className="text-xs cursor-pointer hover:underline" onClick={() => setOpenForgotPassword(true)}>Forgot password?</p>
                            </Field>
                            <Button
                                type="submit"
                                form="login-form"
                                className="w-full"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? "Logging in..." : "Login"}
                            </Button>
                        </div>
                    </form>
                </div>
                <p className="text-sm text-muted-foreground">
                    Don't have an account? <Link to="/register" className="text-foreground">Sign up</Link>
                </p>
            </div>

            {openVerifyEmail && <VerifyEmail />}
            {openForgotPassword && <ForgotPassword />}
        </>
    )
}
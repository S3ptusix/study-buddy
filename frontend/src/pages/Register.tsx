import { Link, useNavigate } from "react-router-dom"
import studyBuddyIcon from "../assets/study-buddy-icon.svg"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"

import { register as registerUser } from "@/services/auth.service"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Field,
    FieldError,
    FieldLabel,
} from "@/components/ui/field"
import axios from "axios"
import { toast } from "@/components/ui/toast"

const formSchema = z
    .object({
        displayName: z
            .string()
            .min(2, "Display name must be at least 2 characters.")
            .max(50, "Display name must be at most 50 characters."),

        username: z
            .string()
            .min(3, "Username must be at least 3 characters.")
            .max(30, "Username must be at most 30 characters.")
            .trim(),

        email: z
            .string()
            .email("Please enter a valid email address.")
            .trim()
            .toLowerCase(),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .max(128, "Password must be at most 128 characters.")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter."
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter."
            )
            .regex(
                /[0-9]/,
                "Password must contain at least one number."
            )
            .regex(
                /[^A-Za-z0-9]/,
                "Password must contain at least one special character."
            ),

        confirmPassword: z.string(),
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        }
    )

export type RegisterFields = z.infer<typeof formSchema>

export default function Register() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFields>({
        resolver: zodResolver(formSchema),

        defaultValues: {
            displayName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    type ApiError = {
        message: string;
        errors?: Record<string, string>;
    };

    const registerMutation = useMutation({
        mutationFn: registerUser,

        onSuccess: (data) => {
            toast.add({
                type: "success",
                title: "Registration failed",
                description: data.message ?? "User account created successfully.",
            })

            navigate("/login");
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

    const onSubmit: SubmitHandler<RegisterFields> = (data) => {
        registerMutation.mutate(data)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-muted">

            {/* Logo */}

            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/")}
            >
                <div className="h-12 aspect-square">
                    <img
                        src={studyBuddyIcon}
                        className="h-full w-full"
                        alt="StudyBuddy"
                    />
                </div>

                <p className="font-semibold">
                    StudyBuddy
                </p>
            </div>

            <div className="text-center">
                <p className="text-xl font-semibold">
                    Create your account
                </p>

                <p className="text-sm text-muted-foreground">
                    Join thousands of learners on StudyBuddy
                </p>
            </div>

            <Card className="w-full max-w-sm">

                <CardContent>

                    <form
                        id="register-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >

                        <div className="flex flex-col gap-6">

                            <Field
                                data-invalid={!!errors.displayName}
                            >
                                <FieldLabel htmlFor="displayName">
                                    Display name
                                </FieldLabel>

                                <Input
                                    {...register("displayName")}
                                    id="displayName"
                                    type="text"
                                    placeholder="Jahleel Casintahan"
                                    aria-invalid={!!errors.displayName}
                                />

                                {errors.displayName && (
                                    <FieldError>
                                        {errors.displayName.message}
                                    </FieldError>
                                )}
                            </Field>

                            <Field
                                data-invalid={!!errors.username}
                            >
                                <FieldLabel htmlFor="username">
                                    Username
                                </FieldLabel>

                                <Input
                                    {...register("username")}
                                    id="username"
                                    type="text"
                                    placeholder="jahleelcasintahan"
                                    aria-invalid={!!errors.username}
                                />

                                {errors.username && (
                                    <FieldError>
                                        {errors.username.message}
                                    </FieldError>
                                )}
                            </Field>

                            <Field
                                data-invalid={!!errors.email}
                            >
                                <FieldLabel htmlFor="email">
                                    Email
                                </FieldLabel>

                                <Input
                                    {...register("email")}
                                    id="email"
                                    type="email"
                                    placeholder="you@email.com"
                                    aria-invalid={!!errors.email}
                                />

                                {errors.email && (
                                    <FieldError>
                                        {errors.email.message}
                                    </FieldError>
                                )}
                            </Field>

                            <Field
                                data-invalid={!!errors.password}
                            >
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>

                                <Input
                                    {...register("password")}
                                    id="password"
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    aria-invalid={!!errors.password}
                                />

                                {errors.password && (
                                    <FieldError>
                                        {errors.password.message}
                                    </FieldError>
                                )}
                            </Field>

                            <Field
                                data-invalid={!!errors.confirmPassword}
                            >
                                <FieldLabel htmlFor="confirmPassword">
                                    Confirm password
                                </FieldLabel>

                                <Input
                                    {...register("confirmPassword")}
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="●●●●●●●●"
                                    aria-invalid={!!errors.confirmPassword}
                                />

                                {errors.confirmPassword && (
                                    <FieldError>
                                        {errors.confirmPassword.message}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                    </form>

                </CardContent>

                <CardFooter className="flex-col gap-2">

                    <Button
                        type="submit"
                        form="register-form"
                        className="w-full"
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending
                            ? "Creating account..."
                            : "Create account"
                        }
                    </Button>


                    {/* Terms */}

                    <p className="text-xs text-muted-foreground">
                        By signing up, you agree to our{" "}
                        <Link
                            to="/"
                            className="text-foreground"
                        >
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                            to="/"
                            className="text-foreground"
                        >
                            Privacy Policy
                        </Link>
                    </p>

                </CardFooter>

            </Card>

            <p className="text-sm text-muted-foreground">
                Already have an account?{" "}

                <Link
                    to="/login"
                    className="text-foreground"
                >
                    Log in
                </Link>
            </p>

        </div>
    )
}
import z from "zod";
import { Field, FieldError, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { passwordSchema } from "@/validations/auth.validation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, resetPassword } from "@/services/auth.service";
import { toast } from "../components/ui/toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { ApiError } from "@/types/error";
import { store } from "@/utils/store";
import studyBuddyIcon from "../assets/study-buddy-icon.svg"

const resetPasswordFields = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        }
    )

export type ResetPasswordFields = z.infer<typeof resetPasswordFields>

export default function ResetPassword() {

    const queryClient = useQueryClient();
    const setUser = store((state) => state.setUser);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFields>({
        resolver: zodResolver(resetPasswordFields),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const resetPasswordMutation = useMutation({
        mutationFn: resetPassword,

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
                    title: "Reset password failed",
                    description: message ?? "Something went wrong. Please try again.",
                })

                console.log("Errors:", error.response?.data.errors);

            } else {
                console.error("Unexpected error:", error);
            }
        },
    });

    const onSubmit: SubmitHandler<ResetPasswordFields> = (data) => {
        resetPasswordMutation.mutate(data.password)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-[5vw] py-20">

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
                    Reset your password
                </p>

                <p className="text-sm text-muted-foreground">
                    Create a new password to secure your StudyBuddy account.
                </p>
            </div>

            <div className="w-full max-w-sm">
                <form
                    id="reset-password-form"
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <div className="flex flex-col gap-6">
                        <Field data-invalid={!!errors.password}>
                            <FieldLabel htmlFor="password">password</FieldLabel>
                            <Input
                                {...register("password")}
                                id="password"
                                type="password"
                                placeholder="you@password.com"
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
                        <Button
                            form="reset-password-form"
                            type="submit"
                            disabled={resetPasswordMutation.isPending}
                            className="w-full"
                        >
                            {resetPasswordMutation.isPending ? "Resetting password..." : "Reset password"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
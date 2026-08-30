import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { emailSchema } from "@/validations/auth.validation";
import { useForm, Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useState } from "react";
import { Button } from "./ui/button";
import { forgotPassword, forgotPasswordVerifyEmail } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useNavigate } from "react-router-dom";
import type { ApiError } from "@/types/error";
import axios from "axios";
import { toast } from "./ui/toast";
import studyBuddyIcon from "../assets/study-buddy-icon.svg"

const verifyEmailFields = z.object({
    email: emailSchema,
    otp: z.string().length(6, "Please enter the 6-digit code"),
})

export type VerifyEmailFields = z.infer<typeof verifyEmailFields>

export default function ForgotPassword() {

    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2>(1);

    const {
        register,
        control,
        trigger,
        getValues,
        handleSubmit,
        formState: { errors },
    } = useForm<VerifyEmailFields>({
        resolver: zodResolver(verifyEmailFields),
        defaultValues: {
            email: "",
            otp: "",
        },
    })

    const sendOtpMutation = useMutation({
        mutationFn: (email: string) => forgotPassword(email),
        onSuccess: () => setStep(2),
        onError: (error) => {
            if (axios.isAxiosError<ApiError>(error)) {

                const err = error.response?.data;

                toast.add({
                    type: "error",
                    title: "Failed to send OTP",
                    description: err?.message ?? "Something went wrong. Please try again.",
                })

            } else {
                console.error("Unexpected error:", error);
            }
        },
    });

    const handleSendOtp = async () => {
        const isValid = await trigger("email");
        if (isValid) {
            const email = getValues("email");
            sendOtpMutation.mutate(email);
        }
    }

    const verifyEmailMutation = useMutation({
        mutationFn: forgotPasswordVerifyEmail,

        onSuccess: () => navigate('/reset-password'),
        onError: (error) => {
            if (axios.isAxiosError<ApiError>(error)) {

                const err = error.response?.data;

                toast.add({
                    type: "error",
                    title: "Registration failed",
                    description: err?.message ?? "Something went wrong. Please try again.",
                })

            } else {
                console.error("Unexpected error:", error);
            }
        },
    });

    const onSubmit = (data: VerifyEmailFields) => {
        verifyEmailMutation.mutate(data);
    }

    return (
        <div className="fixed inset-0 min-h-screen flex flex-col items-center justify-center space-y-8 px-[5vw] py-20 bg-background">
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
                <p className="text-xl font-semibold">Forgot password</p>

                <p className="text-sm text-muted-foreground">
                    {step === 1
                        ? "Enter your email address to continue."
                        : `Enter OTP we sent to ${getValues("email")}.`}
                </p>

            </div>

            <div className="w-full max-w-sm">
                <form
                    id="verify-email-form"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex flex-col gap-6 items-center">
                        {step === 1 ? (
                            <>
                                <Field data-invalid={!!errors.email}>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        {...register("email")}
                                        id="email"
                                        type="text"
                                        placeholder="you@email.com"
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && (
                                        <FieldError>
                                            {errors.email.message}
                                        </FieldError>
                                    )}
                                </Field>
                                <Button
                                    disabled={sendOtpMutation.isPending}
                                    className="w-full"
                                    onClick={handleSendOtp}
                                >
                                    {sendOtpMutation.isPending ? "Sending OTP..." : "Continue"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center gap-2">
                                    <Controller
                                        name="otp"
                                        control={control}
                                        render={
                                            ({ field }) => (
                                                <InputOTP
                                                    maxLength={6}
                                                    pattern={REGEXP_ONLY_DIGITS}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                                        <InputOTPSlot index={0} />
                                                        <InputOTPSlot index={1} />
                                                        <InputOTPSlot index={2} />
                                                    </InputOTPGroup>
                                                    <InputOTPSeparator />
                                                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                                        <InputOTPSlot index={3} />
                                                        <InputOTPSlot index={4} />
                                                        <InputOTPSlot index={5} />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            )}
                                    />
                                    {errors.otp && (
                                        <FieldError>
                                            {errors.otp.message}
                                        </FieldError>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    form="verify-email-form"
                                    className="w-full"
                                >
                                    Submit
                                </Button>

                                <p
                                    className={`text-sm text-muted-foreground ${sendOtpMutation.isPending ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    onClick={handleSendOtp}
                                >
                                    {sendOtpMutation.isPending ? "Sending OTP..." : "Resend OTP"}
                                </p>
                            </>
                        )}
                    </div >
                </form >
            </div >
        </div >
    );
}
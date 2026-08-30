import { AppError } from "../utils/appError.js";
import { resend } from "./resend.js";

type SendEmailInput = {
    to: string | string[];
    subject: string;
    html: string;
};

export async function sendEmail({
    to,
    subject,
    html,
}: SendEmailInput) {

    const { data, error } = await resend.emails.send({
        from: "StudyBuddy <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
    });

    if (error) {
        throw new AppError(error.message, 502);
    }

    return data;
}
import { prisma, VerificationToken } from "@labatory/db";
import { signIn } from "next-auth/react";
import TokenInput from "./TokenInput";

async function TryVerification({ token }: { token: VerificationToken }) {

    const email = token.sendEmail;
    const stringVal = token.stringVal;
    if (!email || !stringVal) throw Error("Invaild token.");

    const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringVal,
    });

    if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw Error(`Failed to sign up; ${payload?.error ?? "internal server error."}`);
    }
}

async function TrySignIn({ stringVal }: { stringVal: string | null }) {

    if (!stringVal) throw Error("Failed automatic login due to Value lost.")

    const Val: { displayName: string, email: string, password: string } = JSON.parse(stringVal);

    if (!Val.password || !Val.email) throw Error("Failed automatic login due to Value lost.");

    const password = Val.password;
    const email = Val.email;

    const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
    });
    if (result?.error) throw Error("Failed automatic login.");
}

export default async function Page({ params, searchParams }: { params: { email: string }; searchParams: { tokenHash?: string } }) {
    const tokenParams = await searchParams;
    const emailParams = await params;
    const email = emailParams.email;
    const tokenHash = tokenParams.tokenHash;

    if (tokenHash) {
        const tokens = await prisma.verificationToken.findMany({
            where: {
                sendEmail: email,
            }
        });

        for (const token of tokens) {
            if (token.sendEmail !== email) continue;
            if (token.usedAt !== null) continue;
            if (token.expireAt.getTime() > Date.now()) continue;

            try {
                TryVerification({ token });
            } catch (e: any) {
                alert(`${e.error ?? "Internal server error."} Please register again.`);
                window.location.href = "/auth/register";
            }

            const stringVal = token.stringVal;
            try {
                TrySignIn({ stringVal });
            } catch (e: any) {
                alert(`${e.error ?? "Internal server error."} Please sign in manually.`);
                window.location.href = "/auth/login";
            }

            alert("Successfully registered");
            window.location.href = "/";
        }

        alert("wrong code input.");
    }

    return (
        <TokenInput />
    )
}
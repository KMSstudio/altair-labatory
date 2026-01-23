// @/lib/mail.ts

import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "@labatory/db";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_ID ?? "",
        pass: process.env.EMAIL_PASSWORD ?? ""
    }
});

const EXPIRE_DURATION = Number(process.env.EXPIRE_DURATION) ?? 50;

export async function SendVerification({ credentialId, stringVal, userEmail }: { credentialId?: bigint, stringVal?: string, userEmail: string }) {

    const rawToken = crypto.randomBytes(3).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex").slice(0, 5);
    const expireAt = new Date(Date.now() + 1000 * 60 * EXPIRE_DURATION);

    try {
        await prisma.verificationToken.create({
            data: {
                credentialId,
                tokenHash,
                stringVal,
                createdAt: new Date(Date.now()),
                expireAt,
                usedAt: null,
                sendEmail: userEmail,
            }
        });
    } catch {
        throw Error("Fail to generate token");
    }

    const verifyUrl = new URL("/auth/verify", process.env.NEXTAUTH_URL);
    verifyUrl.searchParams.set("token", tokenHash);
    verifyUrl.searchParams.set("email", userEmail);

    try {
        await transporter.sendMail({
            from: `"Your Service" <${process.env.EMAIL_NAME}@${process.env.EMAIL_DOMAIN_NAME}>`,
            to: userEmail,
            subject: "이메일 인증을 완료해 주세요",
            text: `아래 링크를 눌러 이메일 인증을 완료해 주세요:\n${verifyUrl.toString()}\n\n이 링크는 ${EXPIRE_DURATION}분 후 만료됩니다.`,
            html: `
            <p>아래 버튼을 눌러 이메일 인증을 완료해 주세요.</p>
            <p><a href="${verifyUrl.toString()}">이메일 인증하기</a></p>
            <p>이 링크는 ${EXPIRE_DURATION}분 후 만료됩니다.</p>
            `,
        });
    } catch {
        return false;
    }
    return true;
}

export async function SendPasswordReset({ credentialId, userEmail }: { credentialId: bigint, userEmail: string }) {

    const rawToken = crypto.randomBytes(3).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex").slice(0, 5);
    const expireAt = new Date(Date.now() + 1000 * 60 * EXPIRE_DURATION);

    try {
        await prisma.verificationToken.create({
            data: {
                credentialId,
                tokenHash,
                createdAt: new Date(Date.now()),
                expireAt,
                usedAt: null,
                sendEmail: userEmail,
            }
        });
    } catch {
        throw Error("Fail to generate token");
    }

    const verifyUrl = new URL("/auth/reset-password", process.env.NEXTAUTH_URL);
    verifyUrl.searchParams.set("token", tokenHash);
    verifyUrl.searchParams.set("email", userEmail);

    try {
        await transporter.sendMail({
            from: `"Your Service" <${process.env.EMAIL_NAME}@${process.env.EMAIL_DOMAIN_NAME}>`,
            to: userEmail,
            subject: "비밀번호를 변경해 주세요",
            text: `아래 링크를 눌러 비밀번호를 변경해 주세요:\n${verifyUrl.toString()}\n\n이 링크는 ${EXPIRE_DURATION}분 후 만료됩니다.`,
            html: `
            <p>아래 버튼을 눌러 비밀번호를 변경해 주세요.</p>
            <p><a href="${verifyUrl.toString()}">비밀번호 변경하기</a></p>
            <p>이 링크는 ${EXPIRE_DURATION}분 후 만료됩니다.</p>
            `,
        });
    } catch {
        return false;
    }
    return true;
}

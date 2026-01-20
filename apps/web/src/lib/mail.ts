// @/lib/mail.ts

import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "@labatory/db";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
});

const ExpireDuration = 5;

export async function SendVerificationEmail({ userId, userEmail }:{ userId:string, userEmail:string }) {

    const tokenHash = crypto.randomBytes(32).toString("hex");
    const expireAt = new Date(Date.now() + 1000 * 60 * ExpireDuration);

    try{
        const id = BigInt(userId);
        await prisma.userVerificationToken.create({
            data:{
                userId:id,
                tokenHash:tokenHash,
                expireAt:expireAt
            }
        });
    } catch{
        throw Error("Fail to generate token");
    }

    const verifyUrl=new URL("/auth/verify",process.env.NEXTAUTH_URL);
    verifyUrl.searchParams.set("token",tokenHash);

    try{
        await transporter.sendMail({
            from: `"Your Service" <no-reply@your-service.com>`,
            to: userEmail,
            subject: "이메일 인증을 완료해 주세요",
            text: `아래 링크를 눌러 이메일 인증을 완료해 주세요:\n${verifyUrl.toString()}\n\n이 링크는 ${ExpireDuration}분 후 만료됩니다.`,
            html: `
            <p>아래 버튼을 눌러 이메일 인증을 완료해 주세요.</p>
            <p><a href="${verifyUrl.toString()}">이메일 인증하기</a></p>
            <p>이 링크는 ${ExpireDuration}분 후 만료됩니다.</p>
            `,
        });
    } catch{
        throw Error("Fail to send verification email");
    }

  return true;
}

export async function SendPasswordChangeEmail({userId, userEmail}:{ userId:string, userEmail:string }){
     const tokenHash = crypto.randomBytes(32).toString("hex");
    const expireAt = new Date(Date.now() + 1000 * 60 * ExpireDuration);

    try{
        const id = BigInt(userId);
        await prisma.userPasswordChangeToken.create({
            data:{
                userId:id,
                tokenHash:tokenHash,
                expireAt:expireAt
            }
        });
    } catch{
        throw Error("Fail to generate token");
    }

    const verifyUrl=new URL("/auth/reset-password",process.env.NEXTAUTH_URL);
    verifyUrl.searchParams.set("token",tokenHash);

    try{
        await transporter.sendMail({
            from: `"Your Service" <no-reply@your-service.com>`,
            to: userEmail,
            subject: "비밀번호를 변경해 주세요",
            text: `아래 링크를 눌러 비밀번호를 변경해 주세요:\n${verifyUrl.toString()}\n\n이 링크는 ${ExpireDuration}분 후 만료됩니다.`,
            html: `
            <p>아래 버튼을 눌러 비밀번호를 변경해 주세요.</p>
            <p><a href="${verifyUrl.toString()}">비밀번호 변경하기</a></p>
            <p>이 링크는 ${ExpireDuration}분 후 만료됩니다.</p>
            `,
        });
    } catch{
        throw Error("Fail to send password reset email");
    }

  return true;
}

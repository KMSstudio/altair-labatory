// @/app/verify/page.tsx

import { prisma } from "@labatory/db";

export default async function Page({ searchParams } : { searchParams: { token?: string }}) {
    const tokenParams = await searchParams;
    if(!tokenParams.token){
        return <div>잘못된 접근입니다.</div>
    }

    const token = await prisma.verificationToken.findUnique({
        where:{ tokenHash: tokenParams.token }
    })
    if(!token) {
        return <div>유효하지 않은 접근입니다.</div>
    }
    if(token.expireAt.getTime() < Date.now()) {
        return <div>메일이 만료되었습니다.</div>
    }
    if(token.usedAt !== null) {
        return <div>이미 이메일을 인증하였습니다.</div>
    }
    if(!token.credentialId) {
        return <div>무언가 잘못되었습니다.</div>
    }

    try {  
        const id = token.credentialId;
        await prisma.$transaction(async (tx) => {
            await tx.userCredential.update({
                where:{ 
                    id,
                 },
                data:{ emailVerified: true }
            })

            await tx.verificationToken.update({
                where: { tokenHash: tokenParams.token },
                data:{
                    usedAt: new Date(Date.now())
                }
            })
        });
    } catch {
        return <main>
            <h1>이메일 검증에 실패했습니다.</h1>
        </main>
    }
   

    return (<main>
        <h1>이메일 검증이 완료되었습니다.</h1>
    </main>);
}

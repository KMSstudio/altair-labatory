// @/app/verify/page.tsx

import { prisma } from "@labatory/db";
export default async function Page({ searchParams } : { searchParams: { token?: string }}) {
    const tokenParams = await searchParams;
    if(!tokenParams.token){
        return <div>잘못된 접근입니다.</div>
    }

    const token = await prisma.userVerificationToken.findUnique({
        where:{ tokenHash: tokenParams.token }
    })
    if(!token){
        return <div>메일이 만료되었거나 링크가 잘못 보내어졌습니다.</div>
    }
    if(token.expireAt.getTime() < Date.now()){
        return <div>메일이 만료되었습니다.</div>
    }
    if(!token.credentialId){
        return <div>무언가 잘못되었습니다.</div>
    }

    await prisma.$transaction(async (tx) => {
        await tx.userCredential.update({
            where:{ id: token.credentialId },
            data:{ emailVerified: true }
        })

        await tx.userVerificationToken.delete({
            where: { tokenHash: tokenParams.token }
        })
    });
   

    return (<main>
        <h1>이메일 검증이 완료되었습니다</h1>
    </main>);
}

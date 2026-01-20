// @/app/reset-password/page.tsx

import { prisma } from "@labatory/db";
import { ResetPassword } from "./ResetPassword";

export default async function Page({ params } : { params: { token?: string }}) {

    if(!params.token){
        return <div>잘못된 접근입니다.</div>
    }

    const token = await prisma.userPasswordChangeToken.findUnique({
        where:{ tokenHash: params.token }
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

    return (<main>
        <h1>비밀번호 변경</h1>
        <ResetPassword token={params.token} />
    </main>);
}

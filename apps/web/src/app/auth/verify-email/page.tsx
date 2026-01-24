'use server';

import { EmailVerificationAction } from "@/util/email-verification";
import { redirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: { token_hash?: string, email?: string } }) {

    let error = null;

    searchParams = await searchParams
    if (!searchParams.email) {
        return <div>invalid access</div>;
    }
    const email = decodeURIComponent(searchParams.email.trim())

    async function OnLoad() {
        if (searchParams.token_hash) {
            try {
                const tokenHash = decodeURIComponent(searchParams.token_hash.trim());
                await EmailVerificationAction({ email, tokenHash });
            } catch (e: any) {
                error = (e.error ?? e.message ?? "Unknown error")
                return false;
            }
            return true;
        }
        return false;
    }
    async function submitAction(formData: FormData) {
        'use server';

        const rawtokenHash = formData.get("tokenHash");

        if (!rawtokenHash) return;

        const tokenHash = rawtokenHash.toString();

        if (tokenHash.length < 5) return;

        redirect(`/auth/verify-email?email=${email}&token_hash=${tokenHash}`)
    }

    if (await OnLoad())
        redirect("/");;

    return (
        <main>
            <h1>Email verification</h1>
            {error ? <p>{error}</p> : null}
            <form action={submitAction}>
                <input name="tokenHash" placeholder="XXXXX" required={true} maxLength={5}></input>
                <button type="submit">Submit</button>
            </form>
        </main>
    )
}
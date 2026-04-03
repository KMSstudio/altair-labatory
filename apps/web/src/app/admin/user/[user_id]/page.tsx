export default async function Page() {
  return (
    <main>
      <h1>Hello World</h1>
    </main>
  );
}

// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { prisma } from "@labatory/db";
// import Layout from "../../layout";
// import styles from "../../admin.module.css";

// async function getUser(userId: bigint) {
//   return prisma.user.findUnique({
//     where: { id: userId },
//     include: {
//       pi: true,
//       credentials: {
//         select: {
//           id: true,
//           provider: true,
//           providerUserId: true,
//           email: true,
//           emailVerified: true,
//           isPrimary: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//         orderBy: { createdAt: "desc" },
//       },
//     },
//   });
// }

// export default async function UserDetailPage({ params }: { params: { user_id: string } }) {
//   params = await params;

//   let id: bigint;
//   try {
//     id = BigInt(params.user_id);
//   } catch {
//     notFound();
//   }

//   const user = await getUser(id);
//   if (!user) notFound();

//   return (
//     <Layout>
//       <main className={styles.adminShell}>
//         <header className={styles.adminHeader}>
//           <div>
//             <p className={styles.eyebrow}>/admin/users/{params.user_id}</p>
//             <h1>{user.displayName}</h1>
//             {user.primaryEmail && <p className={styles.muted}>{user.primaryEmail}</p>}
//           </div>

//           <div className={`${styles.actions} ${styles.actionsEnd}`}>
//             <Link className={styles.ghost} href="/admin/user">
//               ← Back to list
//             </Link>
//             <Link className={styles.ghost} href={`/admin/user/edit/${params.user_id}`}>
//               Edit
//             </Link>
//           </div>
//         </header>

//         <section className={`${styles.panel} ${styles.infoGrid}`}>
//           <div className={styles.infoRow}>
//             <strong>Role:</strong> <span className={styles.value}>{user.role}</span>
//           </div>
//           <div className={styles.infoRow}>
//             <strong>Primary Email:</strong>{" "}
//             <span className={styles.value}>{user.primaryEmail ?? "No email"}</span>
//           </div>
//           <div className={styles.infoRow}>
//             <strong>ID:</strong> <span className={styles.value}>{user.id.toString()}</span>
//           </div>
//           <div className={styles.infoRow}>
//             <strong>Created:</strong>{" "}
//             <span className={styles.value}>{user.createdAt.toISOString()}</span>
//           </div>
//           <div className={styles.infoRow}>
//             <strong>Updated:</strong>{" "}
//             <span className={styles.value}>{user.updatedAt.toISOString()}</span>
//           </div>
//           <div className={styles.infoRow}>
//             <strong>PI:</strong>{" "}
//             <span className={styles.value}>{user.pi ? "Linked" : "Not linked"}</span>
//           </div>
//         </section>
//         <section className={styles.panel}>
//           <header className={styles.panelHead}>
//             <h3>Credentials linked ({user.credentials.length})</h3>
//           </header>

//           {user.credentials.length === 0 ? (
//             <p className={styles.muted}>No credentials linked to this user.</p>
//           ) : (
//             <ul className={styles.list}>
//               {user.credentials.map((cred) => (
//                 <li className={styles.card} key={cred.id.toString()}>
//                   <p>
//                     <strong>ID:</strong> {cred.id.toString()}
//                   </p>
//                   <p>
//                     <strong>Provider:</strong> {cred.provider}
//                     {cred.isPrimary ? " (Primary)" : ""}
//                   </p>
//                   <p>
//                     <strong>Email:</strong> {cred.email}
//                   </p>
//                   <p>
//                     <strong>Email verified:</strong> {cred.emailVerified ? "Yes" : "No"}
//                   </p>
//                   <p>
//                     <strong>Provider user ID:</strong> {cred.providerUserId}
//                   </p>
//                   <p>
//                     <strong>Created:</strong> {cred.createdAt.toISOString()}
//                   </p>
//                   <p>
//                     <strong>Updated:</strong> {cred.updatedAt.toISOString()}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </section>
//       </main>
//     </Layout>
//   );
// }

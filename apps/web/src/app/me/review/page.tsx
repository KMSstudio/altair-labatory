// src/app/me/review/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabReviewsByAuthor } from "@/repository/db/labatory/lab-review";
import Link from "next/link";
import styles from "@/app/lab/lab.module.css";

export default async function MyReviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

  const userId = BigInt(session.user.id);
  const reviews = await getLabReviewsByAuthor({ userId });

  return (
    <main className={styles.labShell}>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>/me/review</p>
          <h1>내 리뷰 목록</h1>
          <p className={styles.lede}>내가 작성한 모든 리뷰를 확인할 수 있습니다.</p>
        </div>
      </header>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>전체 리뷰</p>
            <h3>{reviews.length}개</h3>
          </div>
        </header>

        {reviews.length === 0 ? (
          <p className={styles.muted}>아직 작성한 리뷰가 없습니다.</p>
        ) : (
          <ul className={styles.labGrid}>
            {reviews.map((review) => {
              const labId = review.labId.toString();
              const reviewId = review.id.toString();
              return (
                <li key={reviewId}>
                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <div>
                        <Link href={`/lab/${labId}`} className={styles.cardTitleLink}>
                          <h3>{review.lab.nameKo}</h3>
                        </Link>
                        <p className={styles.value}>{review.recommend ? "추천" : "비추천"}</p>
                      </div>
                      <div className={styles.statusTag}>
                        {review.visib === "PUBLIC" ? "공개" : "비공개"}
                      </div>
                    </div>

                    <div className={styles.tagList}>
                      {(
                        [
                          ["분위기", review.atmos],
                          ["전달력", review.lectr],
                          ["논문", review.paper],
                          ["인건비", review.salry],
                          ["인품", review.persn],
                        ] as const
                      ).map(([label, score]) => (
                        <span key={label} className={styles.tag}>
                          {label} {score}
                        </span>
                      ))}
                    </div>

                    {review.content && (
                      <p
                        className={styles.muted}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {review.content}
                      </p>
                    )}

                    <p className={styles.muted} style={{ fontSize: "0.8rem" }}>
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </p>

                    <div className={styles.cardActions}>
                      <Link
                        href={`/lab/${labId}/review/temporary/${reviewId}`}
                        className={styles.smallGhost}
                      >
                        보기
                      </Link>
                      <Link href={`/review/${reviewId}/edit`} className={styles.smallPrimary}>
                        수정
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

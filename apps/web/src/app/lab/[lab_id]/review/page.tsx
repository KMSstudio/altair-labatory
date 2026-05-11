import { getLabReviews } from "@/repository/db/labatory/lab_review";
import { getLabCore } from "@/repository/db/labatory/labatory";
import { type LabDTO, type LabReviewDTO } from "@/repository/dto/labatory";
import { redirect } from "next/navigation";
import styles from "../../lab.module.css";
import Link from "next/link";
import { PentagonSection } from "./PentagonSection";

/**
 * Calculate Weight of lab review based on its createdDate.
 * exact formula: 1 / (1 + 0.1 * Difference of current time and created time)
 * Treats one day as a unit value of 1, and Difference is floored.
 */
function WeightFunction(parsedReviewDate: number): number {
  return 1 / (1 + 0.1 * Math.floor((Date.now() - parsedReviewDate) / 86400000));
}

type ReviewKey = "atmos" | "lectr" | "paper" | "salry" | "persn";

const ReviewOrder: ReviewKey[] = ["atmos", "lectr", "paper", "salry", "persn"];

export default async function ReviewPage({ params }: { params: { lab_id: string } }) {
  params = await params;
  const n = 2;

  let labId: bigint;
  try {
    labId = BigInt(params.lab_id);
  } catch {
    redirect("/lab");
  }

  let lab: LabDTO | null;
  try {
    lab = await getLabCore({ id: labId });
    if (!lab) throw Error();
  } catch {
    redirect("/lab");
  }
  const labReviews: LabReviewDTO[] = await getLabReviews({ labId });
  let totalWeight: number = 0;
  const labReviewMean: Record<ReviewKey, number> = {
    atmos: 0,
    lectr: 0,
    paper: 0,
    salry: 0,
    persn: 0,
  };

  const contentList: string[] = [];

  if (labReviews.length >= n) {
    labReviews.map((review) => {
      try {
        const weight = WeightFunction(Date.parse(review.createdAt));

        const scores: Record<ReviewKey, number> = {
          atmos: Number(review.atmos),
          lectr: Number(review.lectr),
          paper: Number(review.paper),
          salry: Number(review.salry),
          persn: Number(review.persn),
        };

        totalWeight += weight;

        for (const key in scores) {
          labReviewMean[key] += scores[key] * weight;
        }
      } catch {
        return;
      }

      if (review.visib == "PUBLIC" || review.visib == "PROTECT") {
        contentList.push(review.content);
      }
    });

    for (const key in labReviewMean) {
      labReviewMean[key] /= totalWeight;
    }
  } else {
    labReviewMean.atmos = -1;
    labReviewMean.lectr = -1;
    labReviewMean.paper = -1;
    labReviewMean.salry = -1;
    labReviewMean.persn = -1;
  }
  return (
    <main className={styles.labShell}>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>/lab/{labId}/review</p>
          <h1>{lab.nameKo}</h1>
          {lab.nameEn && <p className={styles.muted}>{lab.nameEn}</p>}
        </div>
        <div className={styles.actions}>
          <Link href={`/lab/${labId}`} className={styles.ghost}>
            ← Back
          </Link>
        </div>
      </header>
      {n <= labReviews.length ? (
        <>
          <PentagonSection
            ReviewOrder={ReviewOrder.map((order) => order.toString())}
            labReviewMean={ReviewOrder.map((order) => labReviewMean[order])}
          />
          <section className={styles.panel}>
            <header className={styles.panelHead}>
              <div>
                <p className={styles.eyebrow}>Reviews</p>
              </div>
            </header>
            {labReviews.map((review) => {
              return (
                <div key={review.id} className={styles.panel}>
                  <p className={styles.value}>{review.content}</p>
                </div>
              );
            })}
          </section>
        </>
      ) : (
        <section className={styles.panel}>
          <div className={styles.primary}>Not enough review!</div>
        </section>
      )}
    </main>
  );
}

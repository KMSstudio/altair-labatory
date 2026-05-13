"use client";

import styles from "../../lab.module.css";
import { useState, useEffect } from "react";
/**
 * calculate angle for point of pentagon.
 * @param i index of each point. point is assigned in clockwise, starting in upward.
 */
function GetAngle(i: number): number {
  return ((Math.PI * 2) / 5) * i - Math.PI / 2;
}

/**
 * calculate svg point for point of pentagon.
 * @param widthCenter horizontial center of svg.
 * @param heightCenter vertical center of svg.
 * @param distance distance of point from the center of svg.
 * @param index index of each point. point is assigned in clockwise, starting in upward.
 */
function GetPoint(
  widthCenter: number,
  heightCenter: number,
  distance: number,
  index: number,
): number[] {
  return [
    widthCenter + distance * Math.cos(GetAngle(index)),
    heightCenter + distance * Math.sin(GetAngle(index)),
  ];
}

export function PentagonSection({
  ReviewOrder,
  labReviewMean,
}: {
  ReviewOrder: string[];
  labReviewMean: number[];
}) {
  if (ReviewOrder.length != 5 || labReviewMean.length != 5) {
    throw new Error("PentagonSection requires exactly 5 review dimensions");
  }
  const [windowCenter, setWindowCenter] = useState(0);
  const PentagonHeight = 500;
  const sizeMultiplier = 0.06;
  useEffect(() => {
    const update = () => setWindowCenter(window.innerWidth / 2);
    update();
    const handleResize = () => {
      setWindowCenter(window.innerWidth / 2);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const backgroundPentagons = [1, 2, 3, 4, 5, 6].map((score) => {
    return [0, 1, 2, 3, 4].map((index) =>
      GetPoint(
        windowCenter,
        PentagonHeight / 2,
        score * Math.min(windowCenter * 2, PentagonHeight) * sizeMultiplier,
        index,
      ),
    );
  });
  const textPoints = Object.fromEntries(
    ReviewOrder.map((scope, index) => [scope, backgroundPentagons[5][index]]),
  );

  const PentagonPoints = labReviewMean.map((score, index) =>
    GetPoint(
      windowCenter,
      PentagonHeight / 2,
      score * Math.min(windowCenter * 2, PentagonHeight) * sizeMultiplier,
      index,
    ),
  );
  return (
    <section className={`${styles.panel}`}>
      <header className={styles.panelHead}>
        <div>
          <p className={styles.eyebrow}>Pentagon</p>
        </div>
      </header>
      <div>
        <svg display="block" width="100%" height={PentagonHeight}>
          {backgroundPentagons.slice(0, 4).map((bckPentagon, index) => {
            return (
              <polygon
                key={index}
                points={bckPentagon.map((point) => point.join(",")).join(" ")}
                fill="none"
                stroke="grey"
                strokeWidth={1}
                strokeDasharray={2}
              />
            );
          })}
          <polygon
            points={backgroundPentagons[4].map((point) => point.join(",")).join(" ")}
            fill="none"
            stroke="black"
            strokeWidth={2}
          />

          <polygon
            points={PentagonPoints.map((point) => point.join(",")).join(" ")}
            fill="blue"
            fillOpacity={0.5}
            stroke="aqua"
            strokeWidth={2}
          />

          {ReviewOrder.map((review) => {
            return (
              <text key={review} x={textPoints[review][0]} y={textPoints[review][1]}>
                {review}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

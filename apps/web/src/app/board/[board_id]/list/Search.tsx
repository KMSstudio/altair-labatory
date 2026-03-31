"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../board.module.css";

export default function Search({ tags }: { tags: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const selectedTags = searchParams.getAll("tags[]");

  function toggleTag(tag: string) {
    const nextSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((v) => v !== tag)
      : [...selectedTags, tag];

    const params = new URLSearchParams(searchParams.toString());

    params.delete("tags[]");
    nextSelectedTags.forEach((v) => {
      params.append("tags[]", v);
    });

    router.replace(`${pathname}?${params.toString()}`);
  }
  return (
    <div className={styles.searchShell}>
      <div className={styles.searchBar}>
        <input className={styles.searchInput} type="text" placeholder="검색어입력" />
        <button
          className={styles.tagToggleButton}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          태그 추가
        </button>
      </div>
      <div className={styles.tagPicker}>
        {isOpen && (
          <div>
            {tags.map((tag) => (
              <button
                className={selectedTags.includes(tag) ? styles.tagButtonSelected : styles.tagButton}
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

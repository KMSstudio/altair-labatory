// @/app/board/TagSelector.tsx

"use client";

import type { TagKind } from "@labatory/db";
import type { TagDTO } from "@/repository/dto/article";
import { useEffect, useState } from "react";
import styles from './board.module.css'

export function TagSelector({ SelectedTags = [] }: { SelectedTags?: TagDTO[] }) {
  const [tagList, setTagList] = useState<TagDTO[]>([]);
  const [tags, setTags] = useState<TagDTO[]>([]);
  const [tagKind, setTagKind] = useState<TagKind>("LAB");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagDTO[]>(SelectedTags);

  function addTag(tag: TagDTO) {
    if (selectedTags.some((t) => t.id === tag.id)) return;
    setSelectedTags([...selectedTags, tag]);
  }
  function removeTag(tag: TagDTO) {
    setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
  }

  useEffect(() => {
    const getTagList = async () => {
      try {
        const res = await fetch("/api/article/tag/get", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          tags?: TagDTO[];
          error?: string;
        } | null;

        if (!res.ok || !data?.tags) {
          throw new Error(data?.error ?? "Failed to get tags.");
        }
        setTagList(data.tags);
      } catch (e) {
        alert(`Fail to load tags: ${e instanceof Error ? e.message : "Unknown Error"}`);
      } finally {
        setLoading(false);
      }
    };
    void getTagList();
  }, []);
  async function onSearch() {
    const loweredTrimmedQuery = query.trim().toLowerCase();
    if (!loweredTrimmedQuery) {
      setTags([]);
      return;
    }

    setErrorMessage(null);

    setTags(
      tagList.filter(
        (tag) => tag.kind === tagKind && tag.text?.toLowerCase().includes(loweredTrimmedQuery),
      ),
    );
  }

  return (
    <div className={styles.tagSelector}>
      {errorMessage ? <p>{errorMessage}</p> : null}

      <div className={styles.tagSelectorSection}>
        <strong>Selected Tags</strong>
        <TagList tags={selectedTags} onSelect={removeTag} emptyMessage="No selected tags." />
        {selectedTags.map((tag) => (
          <input key={tag.id} type="hidden" value={tag.id} name="tagIds" />
        ))}
      </div>

      <div className={styles.tagSelectorSection}>
        <strong>Tags search</strong>
        <label>
          <div className={styles.tagSelectorControls}>
            <input name="query" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
            <select value={tagKind} onChange={(e) => setTagKind(e.target.value as TagKind)}>
              <option value={"TEXT"}>Text</option>
              <option value={"LAB"}>Lab</option>
              <option value={"UNIV"}>Univ</option>
              <option value={"SUBJECT"}>Subject</option>
            </select>
            <button 
              className={styles.tagActionButton}
              type="button" 
              disabled={loading} 
              onClick={onSearch} 
              formNoValidate
            >
              Search
            </button>
          </div>
        </label>

        <TagList tags={tags} onSelect={addTag} emptyMessage="No search result." />
      </div>
    </div>
  );
}

function TagList({
  tags,
  onSelect,
  emptyMessage = "",
}: {
  tags: TagDTO[];
  onSelect: (tag: TagDTO) => void;
  emptyMessage?: string;
}) {
  if (tags.length === 0) return <p>{emptyMessage}</p>;

  return (
    <ul className={styles.tagList}>
      {tags.map((tag) => (
        <li key={tag.id}>
          <TagItem tag={tag} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}

function TagItem({ tag, onSelect }: { tag: TagDTO; onSelect: (tag: TagDTO) => void }) {
  if (!tag) return null;

  return (
    <div>
      <button 
        className={styles.tagButton}
        type="button" 
        onClick={() => onSelect(tag)}>
        {tag.text}
      </button>
    </div>
  );
}

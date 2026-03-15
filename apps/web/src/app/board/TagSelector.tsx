// @/app/board/TagSelector.tsx

"use client";

import type { TagKind } from "@labatory/db";
import type { tagDTO } from "@/repository/dto/article";
import { useEffect, useState } from "react";

export function TagSelector({ SelectedTags = [] }: { SelectedTags?: tagDTO[] }) {
  const [tagList, setTagList] = useState<tagDTO[]>([]);
  const [tags, setTags] = useState<tagDTO[]>([]);
  const [tagKind, setTagKind] = useState<TagKind>("LAB");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<tagDTO[]>(SelectedTags);

  function addTag(tag: tagDTO) {
    if (selectedTags.some((t) => t.id === tag.id)) return;
    setSelectedTags([...selectedTags, tag]);
  }
  function removeTag(tag: tagDTO) {
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
          tags?: tagDTO[];
          error?: string;
        } | null;

        if (!res.ok || !data?.tags) {
          throw new Error(data?.error ?? "Failed to get tags.");
        }
        setTagList(data.tags);
      } catch (e) {
        alert(`Fail to load tags: ${e instanceof Error ? e.message : "Unknown Error"}`);
      }
    };
    getTagList();
  }, []);
  async function onSearch() {
    const loweredTrimmedQuery = query.trim().toLowerCase();
    if (!loweredTrimmedQuery) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      setTags(
        tagList.filter(
          (tag) => tag.kind === tagKind && tag.text?.toLowerCase().includes(loweredTrimmedQuery),
        ),
      );
    } catch (e) {
      setErrorMessage(`Selecting tag error: ${e instanceof Error ? e.message : "Unknown Error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {errorMessage ? <p>{errorMessage}</p> : null}

      <div>
        <strong>Selected Tags</strong>
        <TagList tags={selectedTags} onSelect={removeTag} />
        {selectedTags.map((tag) => (
          <input key={tag.id} type="hidden" value={tag.id} name="tagIds" />
        ))}
      </div>

      <div>
        <strong>Tags search</strong>
        <label>
          <div>
            <input name="query" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
            <select value={tagKind} onChange={(e) => setTagKind(e.target.value as TagKind)}>
              <option value={"TEXT"}>Text</option>
              <option value={"LAB"}>Lab</option>
              <option value={"UNIV"}>Univ</option>
              <option value={"SUBJECT"}>Subject</option>
            </select>
            <button type="button" disabled={loading} onClick={onSearch} formNoValidate>
              Search
            </button>
          </div>
        </label>

        <TagList tags={tags} onSelect={addTag} />
      </div>
    </div>
  );
}

function TagList({ tags, onSelect }: { tags: tagDTO[]; onSelect: (tag: tagDTO) => void }) {
  if (tags.length === 0) return <p>No search result.</p>;

  return (
    <ul>
      {tags.map((tag) => (
        <li key={tag.id}>
          <TagItem tag={tag} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}

function TagItem({ tag, onSelect }: { tag: tagDTO | null; onSelect: (tag: tagDTO) => void }) {
  if (!tag) return null;

  return (
    <div>
      <button type="button" onClick={() => onSelect(tag)}>
        {tag.text}
      </button>
    </div>
  );
}

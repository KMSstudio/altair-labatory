// @/app/board/TagSelector.tsx

"use client";

import type { TagKind } from "@labatory/db";
import type { ArticleTagDTO } from "@/repository/dto/article";
import { SearchArticleTags } from "@/repository/db/article/tag";
import { serializeArticleTag } from "@/repository/serialize/article";
import { useState } from "react";

export function TagSelector({ SelectedTags = [] }: { SelectedTags?: ArticleTagDTO[] }) {
  const [tags, setTags] = useState<ArticleTagDTO[]>([]);
  const [tagKind, setTagKind] = useState<TagKind>("LAB");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<ArticleTagDTO[]>(SelectedTags);

  function addTag(tag: ArticleTagDTO) {
    if (selectedTags.some((t) => t.id === tag.id)) return;
    setSelectedTags([...selectedTags, tag]);
  }
  function removeTag(tag: ArticleTagDTO) {
    setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
  }

  async function onSearch() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      setTags(
        (await SearchArticleTags({ kind: tagKind, query: trimmedQuery })).map(serializeArticleTag),
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

function TagList({
  tags,
  onSelect,
}: {
  tags: ArticleTagDTO[];
  onSelect: (tag: ArticleTagDTO) => void;
}) {
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

function TagItem({
  tag,
  onSelect,
}: {
  tag: ArticleTagDTO | null;
  onSelect: (tag: ArticleTagDTO) => void;
}) {
  if (!tag) return null;

  return (
    <div>
      <button type="button" onClick={() => onSelect(tag)}>
        {tag.text}
      </button>
    </div>
  );
}

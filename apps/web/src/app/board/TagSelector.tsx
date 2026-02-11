"use client"

import { GetTagResult, SearchTags } from "@/util/board.action"
import { type TagKind } from "@labatory/db";
import { useState, useRef } from "react";

export function TagSelector({
    SelectedTags,
    setSelectedTags
}: {
    SelectedTags: GetTagResult[],
    setSelectedTags: (tag: GetTagResult[]) => void
}) {
    const [tags, setTags] = useState<GetTagResult[]>([])
    const [tagKind, setTagKind] = useState<TagKind>("LAB");
    const [query, setQuery] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const isComposing = useRef(false);

    function AddTag(tag: GetTagResult) {
        if (SelectedTags.some(SelectedTag => SelectedTag.id === tag.id))
            return;
        setSelectedTags([...SelectedTags, tag]);
    }
    function removeTag(tag: GetTagResult) {
        setSelectedTags(SelectedTags.filter((t) => t.id !== tag.id));
    }

    async function onSearch() {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        setLoading(true);
        try {
            setTags(await SearchTags(tagKind, trimmedQuery))
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            }
            else {
                setError("unknown error.");
            }
        }
        setLoading(false);
    }
    return (
        <div>
            {error ? <p>{error}</p> : null}
            <div>
                <strong>Selected Tags</strong>
                <TagList tags={SelectedTags} onSelect={removeTag} />
            </div>
            <div>
                <strong>Tags search</strong>
                <label>
                    <div><input
                        name="query"
                        value={query}
                        onCompositionStart={() => {
                            isComposing.current = true;
                        }}
                        onCompositionEnd={(e) => {
                            isComposing.current = false;
                            setQuery(e.currentTarget.value);
                        }}
                        onChange={(e) => {
                            if (!isComposing.current) {
                                setQuery(e.currentTarget.value);
                            }
                        }}
                    />
                        <select value={tagKind} onChange={(e) => setTagKind(e.target.value as TagKind)}>
                            <option value={"TEXT"}>Text</option>
                            <option value={"LAB"}>Lab</option>
                            <option value={"UNIV"}>Univ</option>
                            <option value={"SUBJECT"}>Subject</option>
                        </select>
                        <button type="button" disabled={loading} onClick={() => onSearch()} formNoValidate>
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </label>
                <TagList tags={tags} onSelect={AddTag} />
            </div>
        </div>
    )
}

function TagList({
    tags,
    onSelect,
}: {
    tags: GetTagResult[];
    onSelect: (tag: GetTagResult) => void;
}) {
    if (!tags) return <p>Please input Tag name</p>;
    if (tags.length === 0) return <p>No search result.</p>;

    return (
        <ul>
            {tags.map((tag) => (
                <li key={tag.id.toString()}>
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
    tag: GetTagResult | null;
    onSelect: (tag: GetTagResult) => void;
}) {
    if (!tag) return null;

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    onSelect(tag);
                }}
            >
                {GetTagDisplayText(tag)}
            </button>
        </div>
    );
}

function GetTagDisplayText(tag: GetTagResult): string {

    let text: string = "";
    const nameToText = ((nameKo: string, nameEn: string | null) => { return `${nameKo}(${nameEn ?? ""})` })

    switch (tag.kind) {
        case "LAB":
            if (!tag.lab) break;
            text = nameToText(tag.lab.nameKo, tag.lab.nameEn)
            break;
        case "SUBJECT":
            if (!tag.subj) break;
            text = nameToText(tag.subj.nameKo, tag.subj.nameEn)
            break;
        case "UNIV":
            if (!tag.univ) break;
            text = nameToText(tag.univ.nameKo, tag.univ.nameEn)
            break;
        case "TEXT":
            if (!tag.text) break;
            text = tag.text
            break;
    }
    return text;
}
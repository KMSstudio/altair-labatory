"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateArticle } from "../../actions";
import { type GetTagResult } from "@/util/board.action";
import { TagSelector } from "../../TagSelector";
import { SerializeTag } from "@/util/serialize/SerializeTag";

export default function NewArticleForm({
    boardId,
}: {
    boardId: string;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<GetTagResult[]>([]);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("boardId", boardId);
        formData.append("title", title);
        formData.append("content", content);
        const serializedTags = selectedTags.map((tag) => {
            return SerializeTag(tag)
        })
        formData.append("tags", JSON.stringify(serializedTags));
        console.log(boardId)
        setLoading(true);

        let articleId: bigint | undefined;
        try {
            articleId = await CreateArticle(formData)
            if (articleId === undefined) {
                throw Error("Article creation failed.")
            }
        } catch (e) {
            if (e instanceof Error) {
                alert(e.message);
            }
            else {
                alert("Unknown error ocurred. Please try again.");
            }
            setLoading(false);
            return;
        }

        router.push(`/article/${articleId}`);
    };

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor="title">제목</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="content">내용</label>
                <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <TagSelector setSelectedTags={setSelectedTags} SelectedTags={selectedTags} />
            <button type="submit" disabled={loading}>
                {loading ? "등록 중..." : "등록"}
            </button>
        </form>
    );
}

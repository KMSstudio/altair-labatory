"use client";

import { useState } from "react";
import { Lab } from "@labatory/db";
import { FindLabs } from "../actions";

export function LabPicker({
  selectedLab,
  setLabId,
}: {
  selectedLab?: Lab | null;
  setLabId: (labId: bigint | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labs, setLabs] = useState<Lab[] | null>(null);
  const [selectedLabs, setSelectedLabs] = useState<Lab | null>(selectedLab ?? null);
  async function SearchLab() {
    setError(null);
    setLoading(true);

    const labNameEn = query.trim();

    // 검색 안 하면 리스트 비우기
    if (!labNameEn) {
      setLoading(false);
      return;
    }
    try {
      setLabs(await FindLabs({ labNameEn }));
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Unknown error");
      return;
    }
    setLoading(false);
  }

  function onSelect(lab: Lab | null) {
    if (!lab) {
      setLabId(null);
      setSelectedLabs(null);
    } else {
      setLabId(lab.id);
      setSelectedLabs(lab);
    }
    setQuery("");
    setLabs(null);
  }

  return (
    <section>
      <label>
        <div>Lab</div>
        Search by name(korean)
        <input
          name="labName"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="artificial intelligence"
        />
        <button type="button" disabled={loading} onClick={() => SearchLab()} formNoValidate>
          {loading ? "Searching..." : "Search"}
        </button>
      </label>
      {error ? <p>{error}</p> : null}
      <LabSearchItem lab={selectedLabs} onSelect={(selectedLabs) => onSelect(selectedLabs)} />
      <LabSearchList labs={labs} onSelect={(lab) => onSelect(lab)} />
    </section>
  );
}

export default function LabSearchList({
  labs,
  onSelect,
}: {
  labs: Lab[] | null;
  onSelect: (lab: Lab) => void;
}) {
  if (!labs) return <p>Please input Lab name</p>;
  if (labs.length === 0) return <p>No search result.</p>;

  return (
    <ul>
      {labs.map((lab) => (
        <li key={lab.id.toString()}>
          <LabSearchItem lab={lab} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}

function LabSearchItem(params: { lab: Lab | null; onSelect: (lab: Lab) => void }) {
  if (!params.lab) return <></>;
  const lab = params.lab;
  return (
    <>
      <div>
        <strong>{lab.nameKo}</strong>
        {lab.nameEn ? <div>{lab.nameEn}</div> : null}
        {lab.websiteUrl ? <div>{lab.websiteUrl}</div> : null}
        {lab.description ? <div>{lab.description}</div> : null}
      </div>
      <button
        type="button"
        onClick={() => {
          params.onSelect(lab);
        }}
      >
        Select
      </button>
    </>
  );
}

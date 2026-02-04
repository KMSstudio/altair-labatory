"use client";

import { useState, useRef } from "react";
import { GetLabResult, SearchLabs } from "./actions";

export function LabPicker({
  selectedLab,
  setLabId,
}: {
  selectedLab?: GetLabResult | null;
  setLabId: (labId: bigint | null) => void;
}) {
  const isComposing = useRef(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labs, setLabs] = useState<GetLabResult[] | null>(null);
  const [selectedLabs, setSelectedLabs] = useState<GetLabResult | null>(selectedLab ?? null);
  async function SearchLab() {
    setError(null);
    setLoading(true);

    const trimmedQuery = query.trim();

    // Make list empty if query is empty
    if (!trimmedQuery) {
      setLoading(false);
      return;
    }
    try {
      setLabs(await SearchLabs(trimmedQuery));
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Unknown error");
      return;
    }
    setLoading(false);
  }

  function onSelect(lab: GetLabResult | null) {
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
          placeholder="type http(s)://... to search from Url"
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
  labs: GetLabResult[] | null;
  onSelect: (lab: GetLabResult) => void;
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

function LabSearchItem(params: {
  lab: GetLabResult | null;
  onSelect: (lab: GetLabResult) => void;
}) {
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

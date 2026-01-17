import { NextResponse } from "next/server";

import {
  isUniqueViolation,
  parseUpdateInputFromJson,
  updateSubject,
} from "@/app/subj/subject.service";

const serializeSubject = (s: {
  id: bigint;
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: s.id.toString(),
  nameKo: s.nameKo,
  nameEn: s.nameEn,
  description: s.description,
  isActive: s.isActive,
  createdAt: s.createdAt.toISOString(),
  updatedAt: s.updatedAt.toISOString(),
});

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const { id, data } = parseUpdateInputFromJson(body);
    const updated = await updateSubject(id, data);
    return NextResponse.json({ ok: true, subject: serializeSubject(updated) });
  } catch (e: unknown) {
    if (isUniqueViolation(e)) {
      return NextResponse.json(
        { error: "Subject name must be unique (nameKo/nameEn)." },
        { status: 409 },
      );
    }
    const message = e instanceof Error ? e.message : "Internal server error.";
    const status = message.includes("required") || message.includes("must") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

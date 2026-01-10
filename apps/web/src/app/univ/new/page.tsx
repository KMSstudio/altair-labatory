import Link from "next/link";
import { createUniversity } from "../actions";

export default function NewUniversityPage() {
  return (
    <main className="univ-form-shell">
      <header className="form-head">
        <div>
          <p className="eyebrow">/univ/new</p>
          <h1>Create university</h1>
          <p className="lede">
            Example of writing a new row through Prisma via the shared <code>@labatory/db</code>{" "}
            client.
          </p>
        </div>
        <Link href="/univ" className="ghost">
          ← Back to list
        </Link>
      </header>

      <form action={createUniversity} className="form">
        <label>
          Korean name *
          <input name="nameKo" placeholder="서울대학교" required />
        </label>
        <label>
          English name
          <input name="nameEn" placeholder="Seoul National University" />
        </label>
        <label>
          Country
          <input name="country" placeholder="Korea" />
        </label>
        <label>
          Website URL
          <input name="websiteUrl" type="url" placeholder="https://www.snu.ac.kr/" />
        </label>

        <div className="actions">
          <Link href="/univ" className="ghost">
            Cancel
          </Link>
          <button type="submit">Create</button>
        </div>
      </form>

      <style jsx>{`
        .univ-form-shell {
          display: grid;
          gap: 1.5rem;
          padding: 2rem 0;
        }
        .form-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .form {
          display: grid;
          gap: 1rem;
          background: #fff;
          border: 1px solid #e0e4ea;
          border-radius: 12px;
          padding: 1.5rem;
        }
        label {
          display: grid;
          gap: 0.35rem;
          font-weight: 600;
        }
        input {
          padding: 0.7rem 0.8rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }
        input:focus {
          outline: 2px solid #111827;
          border-color: #111827;
        }
        .actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }
        button {
          border: none;
          background: #111827;
          color: #fff;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }
        .ghost {
          background: #f3f4f6;
          color: #374151;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.75rem;
          color: #5f6b7a;
          margin: 0;
        }
        .lede {
          color: #4a5563;
          max-width: 620px;
        }
        @media (max-width: 700px) {
          .form-head {
            flex-direction: column;
            align-items: flex-start;
          }
          .actions {
            justify-content: stretch;
          }
        }
      `}</style>
    </main>
  );
}

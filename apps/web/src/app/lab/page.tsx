import { prisma } from "@labatory/db";

export default async function LabPage() {
  const labs = await prisma.lab.findMany({
    orderBy: { nameKo: "asc" },
    include: {
      university: true,
      pi: true,
    },
  });

  return (
    <main>
      <header>
        <h1>Labs</h1>
        <p>All labs currently in the database.</p>
      </header>

      <section>
        <table border={1} cellPadding={6} cellSpacing={0}>
          <caption>Lab Directory</caption>
          <thead>
            <tr>
              <th>Lab</th>
              <th>University</th>
              <th>PI</th>
              <th>Website</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab) => (
              <tr key={lab.id.toString()}>
                <td>
                  <div>{lab.nameKo}</div>
                  {lab.nameEn ? <div>({lab.nameEn})</div> : null}
                </td>
                <td>
                  {lab.university ? (
                    <div>
                      <div>{lab.university.nameKo}</div>
                      {lab.university.nameEn ? (
                        <div>({lab.university.nameEn})</div>
                      ) : null}
                    </div>
                  ) : (
                    <em>Not set</em>
                  )}
                </td>
                <td>{lab.pi ? lab.pi.name : <em>Not set</em>}</td>
                <td>
                  {lab.websiteUrl ? (
                    <a href={lab.websiteUrl}>{lab.websiteUrl}</a>
                  ) : (
                    <em>Not set</em>
                  )}
                </td>
              </tr>
            ))}
            {labs.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <em>No labs found.</em>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export function JsonLd({ data }: { data: object | object[] | null | (object | null)[] }) {
  const rawItems = Array.isArray(data) ? data : [data];
  // Filter out null/undefined entries so disabled schemas don't render empty <script> tags
  const items = rawItems.filter((item): item is object => item !== null && item !== undefined);
  if (items.length === 0) return null;
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
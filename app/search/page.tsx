import SearchClient from "./search-client";

type SearchParams = Record<string, string | string[] | undefined>;

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return <SearchClient initialQuery={getQueryValue(params.query)} />;
}
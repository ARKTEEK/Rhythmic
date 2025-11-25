import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProviderName } from "../../utils/providerUtils.tsx";
import { searchSong } from "../../services/PlaylistsService.ts";
import { OAuthProvider } from "../../models/Connection.ts";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const useSongSearch = (
  providerRaw: OAuthProvider,
  providerAccountId: string,
  searchTerm: string
) => {
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const isValidSearch = debouncedSearchTerm.length > 0;
  const providerName = getProviderName(providerRaw);

  const query = useQuery({
    queryKey: ['search', providerName, providerAccountId, debouncedSearchTerm],
    queryFn: () => searchSong(providerName, providerAccountId, debouncedSearchTerm),
    enabled: isValidSearch,
    staleTime: 1000 * 60,
  });

  return {
    ...query,
    results: query.data || [],
    isLoading: (searchTerm !== debouncedSearchTerm) || query.isFetching
  };
};

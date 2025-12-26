import { useMemo, useState } from "react";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { getProviderName } from "../../utils/providerUtils.tsx";

interface FilterCriteria {
  title?: string;
  provider?: string;
  tracksOperator?: ">" | "<" | "=" | ">=" | "<=";
  tracksValue?: number;
}

export const usePlaylistFilter = (playlists: ProviderPlaylist[]) => {
  const [searchQuery, setSearchQuery] = useState("");

  const parseSearchQuery = (query: string): FilterCriteria => {
    const criteria: FilterCriteria = {};

    if (!query) return criteria;

    const parts = query.split("&").map(p => p.trim());

    for (const part of parts) {
      const tracksMatch = part.match(/tracks?\s*([><=]+)\s*(\d+)/i);
      if (tracksMatch) {
        criteria.tracksOperator = tracksMatch[1] as FilterCriteria["tracksOperator"];
        criteria.tracksValue = parseInt(tracksMatch[2]);
        continue;
      }

      const providerMatch = part.match(/provider\s*=\s*(\w+)/i);
      if (providerMatch) {
        criteria.provider = providerMatch[1].toLowerCase();
        continue;
      }

      if (!part.includes("=") && !part.match(/[><]/)) {
        criteria.title = part;
      }
    }

    return criteria;
  };

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return playlists;

    const criteria = parseSearchQuery(searchQuery);

    return playlists.filter(playlist => {
      if (criteria.title) {
        const titleMatch = playlist.title.toLowerCase().includes(criteria.title.toLowerCase());
        if (!titleMatch) return false;
      }

      if (criteria.provider) {
        const providerName = getProviderName(playlist.provider).toLowerCase();
        if (!providerName.includes(criteria.provider)) return false;
      }

      if (criteria.tracksOperator && criteria.tracksValue !== undefined) {
        const trackCount = playlist.itemCount;
        const value = criteria.tracksValue;

        switch (criteria.tracksOperator) {
          case ">":
            if (!(trackCount > value)) return false;
            break;
          case "<":
            if (!(trackCount < value)) return false;
            break;
          case "=":
            if (!(trackCount === value)) return false;
            break;
          case ">=":
            if (!(trackCount >= value)) return false;
            break;
          case "<=":
            if (!(trackCount <= value)) return false;
            break;
        }
      }

      return true;
    });
  }, [playlists, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredPlaylists,
  };
};


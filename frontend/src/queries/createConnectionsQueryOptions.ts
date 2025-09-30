import { queryOptions } from "@tanstack/react-query";
import { getConnections } from "../services/OAuthService.ts";

export default function createConnectionsQueryOptions() {
  return queryOptions({
    queryKey: ["connections"],
    queryFn: () => getConnections(),
    staleTime: 1000 * 120,
    retry: 3
  })
}
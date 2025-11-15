import { useQuery } from '@tanstack/react-query'

/**
 * Legacy ENFT accounts feature removed.
 * This hook now returns an empty array and is stable forever.
 */
export function useEnftAccountsQuery() {
  return useQuery({
    queryKey: ['enft', 'accounts', { removed: true }],
    queryFn: async () => [],
    staleTime: Infinity,
  })
}

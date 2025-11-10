import { useQueryClient } from '@tanstack/react-query'
import { useEnftAccountsQueryKey } from './use-enft-accounts-query-key'

export function useEnftAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useEnftAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}

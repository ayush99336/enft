import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { getEnftProgramAccounts } from '@project/anchor'
import { useEnftAccountsQueryKey } from './use-enft-accounts-query-key'

export function useEnftAccountsQuery() {
  const { client } = useSolana()

  return useQuery({
    queryKey: useEnftAccountsQueryKey(),
    queryFn: async () => await getEnftProgramAccounts(client.rpc),
  })
}

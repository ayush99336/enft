import { useSolana } from '@/components/solana/use-solana'

export function useEnftAccountsQueryKey() {
  const { cluster } = useSolana()

  return ['enft', 'accounts', { cluster }]
}

import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { fetchStakeConfig, getStakeConfigPda } from '@project/anchor'

export function useStakeConfig() {
  const { client, cluster } = useSolana()

  const configPda = getStakeConfigPda()

  return useQuery({
    queryKey: ['stake-config', { cluster }],
    queryFn: async () => {
      try {
        const account = await fetchStakeConfig(client.rpc, configPda)
        return account
      } catch (error) {
        console.error('Error fetching stake config:', error)
        return null
      }
    },
  })
}

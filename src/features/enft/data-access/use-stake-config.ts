import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { fetchStakeConfig, ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'
import { getProgramDerivedAddress } from 'gill'

export function useStakeConfig() {
  const { client, clusterId } = useSolana()

  return useQuery({
    queryKey: ['stake-config', { clusterId }],
    queryFn: async () => {
      try {
        const [configPda] = await getProgramDerivedAddress({
          programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
          seeds: [new TextEncoder().encode('config')],
        })

        const account = await fetchStakeConfig(client.rpc, configPda)
        return account
      } catch (error) {
        if (error instanceof Error && error.message.includes('Account not found')) {
          return null
        }

        console.error('Error fetching stake config:', error)
        throw error
      }
    },
  })
}

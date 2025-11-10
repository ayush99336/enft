import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { fetchUserAccount } from '@project/anchor'
import { getProgramDerivedAddress, pipe, getBase58Encoder } from 'gill'
import { ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'

export function useUserAccount(userAddress?: string) {
  const { client, clusterId } = useSolana()

  return useQuery({
    queryKey: ['user-account', { clusterId, userAddress }],
    queryFn: async () => {
      if (!userAddress) return null

      try {
        const [userAccountPda] = await getProgramDerivedAddress({
          programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
          seeds: [new TextEncoder().encode('user'), pipe(userAddress, getBase58Encoder().encode)],
        })

        const account = await fetchUserAccount(client.rpc, userAccountPda)
        return { ...account, address: userAccountPda }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Account not found')) {
          return null
        }

        console.error('Error fetching user account:', error)
        throw error
      }
    },
    enabled: !!userAddress,
  })
}

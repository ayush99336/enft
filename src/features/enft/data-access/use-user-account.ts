import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { fetchUserAccount } from '@project/anchor'
import { getProgramDerivedAddress } from 'gill'
import { ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'

export function useUserAccount(userAddress?: string) {
  const { client, cluster } = useSolana()

  return useQuery({
    queryKey: ['user-account', { cluster, userAddress }],
    queryFn: async () => {
      if (!userAddress) return null

      try {
        const [userAccountPda] = await getProgramDerivedAddress({
          programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
          seeds: [
            new TextEncoder().encode('user'),
            userAddress,
          ],
        })

        const account = await fetchUserAccount(client.rpc, userAccountPda)
        return { ...account, address: userAccountPda }
      } catch (error) {
        console.error('Error fetching user account:', error)
        return null
      }
    },
    enabled: !!userAddress,
  })
}

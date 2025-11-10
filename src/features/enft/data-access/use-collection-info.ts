import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { fetchCollectionInfo } from '@project/anchor'
import { getProgramDerivedAddress } from 'gill'
import { ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'

export function useCollectionInfo(collectionAddress?: string) {
  const { client, cluster } = useSolana()

  return useQuery({
    queryKey: ['collection-info', { cluster, collectionAddress }],
    queryFn: async () => {
      if (!collectionAddress) return null

      try {
        const [collectionInfoPda] = await getProgramDerivedAddress({
          programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
          seeds: [
            new TextEncoder().encode('collection'),
            collectionAddress,
          ],
        })

        const account = await fetchCollectionInfo(client.rpc, collectionInfoPda)
        return { ...account, address: collectionInfoPda }
      } catch (error) {
        console.error('Error fetching collection info:', error)
        return null
      }
    },
    enabled: !!collectionAddress,
  })
}

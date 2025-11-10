import { useSolana } from '@/components/solana/use-solana'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getInitializeConfigInstruction, ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'
import { useTransactionToast } from '@/components/use-transaction-toast'
import { getProgramDerivedAddress, pipe, getBase58Encoder } from 'gill'

export function useEnftInitializeMutation() {
  const { client, account } = useSolana()
  const transactionToast = useTransactionToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['enft', 'initialize', { cluster: client.rpc.getCluster() }],
    mutationFn: async ({
      pointsPerStake,
      maxStake,
      freezePeriod,
    }: {
      pointsPerStake: number
      maxStake: number
      freezePeriod: number
    }) => {
      if (!account) throw new Error('Wallet not connected')

      const [configPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('config')],
      })

      const [rewardMintPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('rewards'), pipe(configPda, getBase58Encoder().encode)],
      })

      const instruction = getInitializeConfigInstruction({
        admin: account.address,
        config: configPda,
        rewardMint: rewardMintPda,
        pointsPerStake,
        maxStake,
        freezePeriod,
      })

      return await client.sign([instruction]).sendAndConfirm(client.rpc)
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      queryClient.invalidateQueries({ queryKey: ['stake-config'] })
    },
    onError: (error) => {
      console.error('Failed to initialize config:', error)
    },
  })
}

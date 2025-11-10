import { useSolana } from '@/components/solana/use-solana'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getUnstakeInstructionAsync, ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'
import { useTransactionToast } from '@/components/use-transaction-toast'
import { useWalletUiSigner } from '@wallet-ui/react'
import {
  getProgramDerivedAddress,
  pipe,
  getBase58Encoder,
  createTransaction,
  signAndSendTransactionMessageWithSigners,
  getBase58Decoder,
  type Address,
} from 'gill'

export function useUnstakeMutation() {
  const { client, account, clusterId } = useSolana()
  const signer = useWalletUiSigner({ account: account! })
  const transactionToast = useTransactionToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['enft', 'unstake', { clusterId }],
    mutationFn: async ({ assetAddress, collectionAddress }: { assetAddress: Address; collectionAddress: Address }) => {
      if (!account) throw new Error('Wallet not connected')

      const [configPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('config')],
      })

      const [userAccountPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('user'), pipe(account.address, getBase58Encoder().encode)],
      })

      const [stakeAccountPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [
          new TextEncoder().encode('stake'),
          pipe(configPda, getBase58Encoder().encode),
          pipe(assetAddress, getBase58Encoder().encode),
        ],
      })

      const instruction = await getUnstakeInstructionAsync({
        user: signer,
        config: configPda,
        userAccount: userAccountPda,
        stakeAccount: stakeAccountPda,
        asset: assetAddress,
        collection: collectionAddress,
      })

      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

      const transaction = createTransaction({
        feePayer: signer,
        version: 0,
        latestBlockhash,
        instructions: [instruction],
      })

      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
      const signature = getBase58Decoder().decode(signatureBytes)

      return signature
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      queryClient.invalidateQueries({ queryKey: ['user-account'] })
      queryClient.invalidateQueries({ queryKey: ['staked-nfts'] })
    },
    onError: (error) => {
      console.error('Failed to unstake NFT:', error)
    },
  })
}

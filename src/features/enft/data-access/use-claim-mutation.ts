import { useSolana } from '@/components/solana/use-solana'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getClaimInstructionAsync, ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'
import { useTransactionToast } from '@/components/use-transaction-toast'
import { useWalletUiSigner } from '@wallet-ui/react'
import {
  getProgramDerivedAddress,
  pipe,
  getBase58Encoder,
  createTransaction,
  signAndSendTransactionMessageWithSigners,
  getBase58Decoder,
} from 'gill'

export function useClaimMutation() {
  const { client, account, clusterId } = useSolana()
  const signer = useWalletUiSigner({ account: account! })
  const transactionToast = useTransactionToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['enft', 'claim', { clusterId }],
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected')

      const [configPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('config')],
      })

      const [userAccountPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('user'), pipe(account.address, getBase58Encoder().encode)],
      })

      const [rewardMintPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('rewards'), pipe(configPda, getBase58Encoder().encode)],
      })

      const instruction = await getClaimInstructionAsync({
        user: signer,
        config: configPda,
        userAccount: userAccountPda,
        rewardMint: rewardMintPda,
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
      queryClient.invalidateQueries({ queryKey: ['token-accounts'] })
    },
    onError: (error) => {
      console.error('Failed to claim rewards:', error)
    },
  })
}

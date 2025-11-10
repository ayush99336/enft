import { useSolana } from '@/components/solana/use-solana'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getInitializeUserInstructionAsync, ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'
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

export function useInitializeUserMutation() {
  const { client, account, clusterId } = useSolana()
  const signer = useWalletUiSigner({ account: account! })
  const transactionToast = useTransactionToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['enft', 'initialize-user', { clusterId }],
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected')

      const [userAccountPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('user'), pipe(account.address, getBase58Encoder().encode)],
      })

      const instruction = await getInitializeUserInstructionAsync({
        user: signer,
        userAccount: userAccountPda,
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
    },
    onError: (error) => {
      console.error('Failed to initialize user account:', error)
    },
  })
}

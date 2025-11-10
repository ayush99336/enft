import { useSolana } from '@/components/solana/use-solana'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getInitializeConfigInstructionAsync, fetchStakeConfig } from '@project/anchor'
import { useTransactionToast } from '@/components/use-transaction-toast'
import { useWalletUiSigner } from '@wallet-ui/react'
import { createTransaction, signAndSendTransactionMessageWithSigners, getBase58Decoder, type Signature } from 'gill'

export function useEnftInitializeMutation() {
  const { client, account, clusterId } = useSolana()
  const signer = useWalletUiSigner({ account: account! })
  const transactionToast = useTransactionToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['enft', 'initialize', { clusterId }],
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

      const instruction = await getInitializeConfigInstructionAsync({
        admin: signer,
        pointsPerStake,
        maxStake,
        freezePeriod,
      })

      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

      const transaction = createTransaction({
        feePayer: signer,
        version: 0,
        latestBlockhash,
        instructions: [instruction],
      })

      let signature: Signature
      try {
        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        signature = getBase58Decoder().decode(signatureBytes) as Signature
      } catch (e) {
        console.error('signAndSend error:', e)
        throw e
      }

      for (let i = 0; i < 10; i++) {
        const statusResp = await client.rpc.getSignatureStatuses([signature]).send()
        const st = statusResp.value?.[0]
        if (st?.confirmationStatus === 'confirmed' || st?.confirmationStatus === 'finalized') break
        await new Promise((r) => setTimeout(r, 1500))
      }

      const builtConfig = instruction.accounts[1].address
      try {
        await fetchStakeConfig(client.rpc, builtConfig)
      } catch {
        console.error('Config PDA not found after initialize. Sig:', signature, 'Config PDA:', builtConfig)
        throw new Error(`Initialize did not create config PDA. Signature: ${signature}`)
      }

      return signature
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

import { useSolana } from '@/components/solana/use-solana'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getStakeInstructionAsync, ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'
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

export function useStakeMutation() {
  const { client, account, clusterId } = useSolana()
  const signer = useWalletUiSigner({ account: account! })
  const transactionToast = useTransactionToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['enft', 'stake', { clusterId }],
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

      // Preflight: ensure asset and collection are MPL Core accounts and initialized
      const CORE_PROGRAM_ID = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
      const assetResp = await client.rpc.getAccountInfo(assetAddress).send()
      const collectionResp = await client.rpc.getAccountInfo(collectionAddress).send()
      const assetInfo = assetResp.value
      const collectionInfo = collectionResp.value
      if (!assetInfo) {
        throw new Error('Asset account not found')
      }
      if (assetInfo.owner !== CORE_PROGRAM_ID) {
        throw new Error('Invalid asset: not an MPL Core asset')
      }
      if (!assetInfo.data || assetInfo.data.length === 0) {
        throw new Error('Asset not initialized')
      }
      if (!collectionInfo) {
        throw new Error('Collection account not found')
      }
      if (collectionInfo.owner !== CORE_PROGRAM_ID) {
        throw new Error('Invalid collection: not an MPL Core collection')
      }
      if (!collectionInfo.data || collectionInfo.data.length === 0) {
        throw new Error('Collection not initialized')
      }
      // Preflight: ensure stake account does not already exist
      const existingStakeResp = await client.rpc.getAccountInfo(stakeAccountPda).send()
      if (existingStakeResp.value) {
        throw new Error('This NFT is already staked')
      }

      const instruction = await getStakeInstructionAsync({
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
      console.error('Failed to stake NFT:', error)
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import { useSolana } from '@/components/solana/use-solana'
import { ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS, fetchStakeAccount, type StakeAccount } from '@project/anchor'
import { getProgramDerivedAddress, getBase58Encoder, pipe, type Address } from 'gill'

export type StakeStatus = {
  stakePda: Address
  staked: boolean
  account?: StakeAccount
  // Computed helpers when freezePeriodSeconds is provided
  canUnstake?: boolean
  timeRemainingSeconds?: number
}

export function useStakeStatus({
  assetAddress,
  configAddress,
  freezePeriodSeconds,
}: {
  assetAddress: Address
  configAddress?: Address
  freezePeriodSeconds?: number
}) {
  const { client, clusterId } = useSolana()

  return useQuery({
    queryKey: ['stake-status', { clusterId, assetAddress, configAddress, freezePeriodSeconds }],
    queryFn: async (): Promise<StakeStatus> => {
      // Derive config PDA if not provided.
      const [configPda] = configAddress
        ? [configAddress]
        : await getProgramDerivedAddress({
            programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
            seeds: [new TextEncoder().encode('config')],
          })

      // Derive stake PDA: ["stake", config, asset]
      const [stakePda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [
          new TextEncoder().encode('stake'),
          pipe(configPda, getBase58Encoder().encode),
          pipe(assetAddress, getBase58Encoder().encode),
        ],
      })

      try {
        const account = await fetchStakeAccount(client.rpc, stakePda)

        // Optionally compute canUnstake/timeRemaining if freezePeriodSeconds provided.
        let canUnstake: boolean | undefined
        let timeRemainingSeconds: number | undefined
        if (typeof freezePeriodSeconds === 'number' && freezePeriodSeconds >= 0) {
          const now = Math.floor(Date.now() / 1000)
          // stakedAt might be bigint/number depending on codegen; coerce with Number().
          const stakedAt = Number(account.data.stakedAt)
          const elapsed = Math.max(0, now - stakedAt)
          canUnstake = elapsed >= freezePeriodSeconds
          timeRemainingSeconds = Math.max(0, freezePeriodSeconds - elapsed)
        }

        return {
          stakePda,
          staked: true,
          account,
          canUnstake,
          timeRemainingSeconds,
        }
      } catch (e: any) {
        if (e instanceof Error && e.message.includes('Account not found')) {
          return {
            stakePda,
            staked: false,
          }
        }
        // Re-throw other unexpected errors.
        throw e
      }
    },
  })
}

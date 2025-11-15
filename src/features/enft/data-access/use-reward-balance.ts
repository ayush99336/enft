import { useQuery } from '@tanstack/react-query'
import { useSolana } from '@/components/solana/use-solana'
import {
  ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
} from '@project/anchor'
import {
  getProgramDerivedAddress,
  getBase58Encoder,
  pipe,
  type Address,
} from 'gill'
import { PublicKey } from '@solana/web3.js'

/**
 * Hook: useRewardBalance
 *
 * Derives:
 *  - Config PDA: ["config"]
 *  - Reward Mint PDA: ["rewards", config]
 *  - User Associated Token Account (ATA) for the reward mint
 *
 * Reads the SPL Token account data (standard Token program) and returns the
 * raw amount (u64) adjusted by reward mint decimals (currently 6 as set in initialize_config).
 *
 * Query key includes clusterId and wallet address. The claim mutation in the codebase
 * invalidates the 'token-accounts' query key so this hook uses that prefix to refresh
 * automatically after a claim.
 */
export interface UseRewardBalanceResult {
  ataAddress?: string
  mintAddress?: string
  rawAmount: bigint
  amount: number
  decimals: number
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
const REWARD_MINT_DECIMALS = 6

export function useRewardBalance(accountAddress?: Address): UseRewardBalanceResult {
  const { client, clusterId } = useSolana()

  const query = useQuery({
    enabled: !!accountAddress,
    queryKey: ['token-accounts', 'reward-balance', { clusterId, accountAddress }],
    queryFn: async () => {
      if (!accountAddress) {
        return {
          ataAddress: undefined,
          mintAddress: undefined,
          rawAmount: 0n,
          amount: 0,
        }
      }

      // 1. Derive config PDA
      const [configPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('config')],
      })

      // 2. Derive reward mint PDA: ["rewards", config]
      const [rewardMintPda] = await getProgramDerivedAddress({
        programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode('rewards'), pipe(configPda, getBase58Encoder().encode)],
      })

      // 3. Derive user ATA
      const ownerPk = new PublicKey(accountAddress)
      const mintPk = new PublicKey(rewardMintPda)
      const [ataPk] = PublicKey.findProgramAddressSync(
        [ownerPk.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPk.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )

      // 4. Fetch account info
      const info = await client.rpc.getAccountInfo(ataPk.toBase58()).send()
      if (!info) {
        // ATA not created yet → balance is zero.
        return {
          ataAddress: ataPk.toBase58(),
          mintAddress: mintPk.toBase58(),
          rawAmount: 0n,
          amount: 0,
        }
      }

      const data = info.data
      // SPL Token account layout (Token program):
      //   offset 64..72 (8 bytes LE) = amount
      if (data.length < 72) {
        throw new Error('Invalid token account data length')
      }
      const rawAmount = data.readBigUInt64LE(64)
      const amount = Number(rawAmount) / 10 ** REWARD_MINT_DECIMALS

      return {
        ataAddress: ataPk.toBase58(),
        mintAddress: mintPk.toBase58(),
        rawAmount,
        amount,
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  return {
    ataAddress: (query.data as any)?.ataAddress,
    mintAddress: (query.data as any)?.mintAddress,
    rawAmount: (query.data as any)?.rawAmount ?? 0n,
    amount: (query.data as any)?.amount ?? 0,
    decimals: REWARD_MINT_DECIMALS,
    isLoading: query.isLoading,
    error: (query.error as Error) ?? null,
    refetch: query.refetch,
  }
}

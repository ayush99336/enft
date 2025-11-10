// Here we export some useful types and functions for interacting with the Anchor program.
import { SolanaClient } from 'gill'

// Re-export everything from the generated client
export * from './client/js/generated'

// Re-export the IDL
import EnftIDL from '../target/idl/anchor_nft_staking_q4_25.json'
export { EnftIDL }

// Export program address constant
export { ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from './client/js/generated'

// Type helpers
export type { StakeConfig, UserAccount, StakeAccount, CollectionInfo } from './client/js/generated'

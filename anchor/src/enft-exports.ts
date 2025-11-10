// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, getBase58Decoder, SolanaClient } from 'gill'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Enft, ENFT_DISCRIMINATOR, ENFT_PROGRAM_ADDRESS, getEnftDecoder } from './client/js'
import EnftIDL from '../target/idl/anchor_nft_staking_q4_25.json'

export type EnftAccount = Account<Enft, string>

// Re-export the generated IDL and type
export { EnftIDL }

export * from './client/js'

export function getEnftProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getEnftDecoder(),
    filter: getBase58Decoder().decode(ENFT_DISCRIMINATOR),
    programAddress: ENFT_PROGRAM_ADDRESS,
  })
}

import { ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function EnftUiProgramExplorerLink() {
  return (
    <AppExplorerLink
      address={ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS}
      label={ellipsify(ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS)}
    />
  )
}

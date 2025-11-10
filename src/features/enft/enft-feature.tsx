import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { EnftUiButtonInitialize } from './ui/enft-ui-button-initialize'
import { EnftUiList } from './ui/enft-ui-list'
import { EnftUiProgramExplorerLink } from './ui/enft-ui-program-explorer-link'
import { EnftUiProgramGuard } from './ui/enft-ui-program-guard'

export default function EnftFeature() {
  const { account } = useSolana()

  return (
    <EnftUiProgramGuard>
      <AppHero
        title="Enft"
        subtitle={
          account
            ? "Initialize a new enft onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <EnftUiProgramExplorerLink />
        </p>
        {account ? (
          <EnftUiButtonInitialize account={account} />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>
      {account ? <EnftUiList account={account} /> : null}
    </EnftUiProgramGuard>
  )
}

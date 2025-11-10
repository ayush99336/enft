import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { EnftUiProgramGuard } from './ui/enft-ui-program-guard'
import { EnftUiProgramExplorerLink } from './ui/enft-ui-program-explorer-link'
import { StakingDashboard } from './ui/staking-dashboard'
import { AdminPanel } from './ui/admin-panel'
import { useState } from 'react'

export default function EnftFeature() {
  const { account } = useSolana()
  const [activeTab, setActiveTab] = useState<'stake' | 'admin'>('stake')

  return (
    <EnftUiProgramGuard>
      <AppHero
        title="NFT Staking Platform"
        subtitle={
          account
            ? 'Stake your NFTs to earn rewards. Track your staked assets and claim your earnings.'
            : 'Connect your wallet to start staking NFTs and earning rewards.'
        }
      >
        <p className="mb-6">
          <EnftUiProgramExplorerLink />
        </p>
        {!account && (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>

      {account && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('stake')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'stake'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Staking Dashboard
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin Panel
            </button>
          </div>

          {/* Content */}
          {activeTab === 'stake' ? <StakingDashboard account={account} /> : <AdminPanel account={account} />}
        </div>
      )}
    </EnftUiProgramGuard>
  )
}

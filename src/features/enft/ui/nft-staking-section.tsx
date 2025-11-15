import { UiWalletAccount } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Unlock } from 'lucide-react'
import { useStakeMutation } from '../data-access/use-stake-mutation'
import { useUnstakeMutation } from '../data-access/use-unstake-mutation'
import { useWalletAssets } from '../data-access/use-wallet-assets'
import { useStakeStatus } from '../data-access/use-stake-status'
import { type Address } from 'gill'

type StakeConfigView = { data: { freezePeriod: number; maxStake: number } }
type UserAccountView = { data: { amountStaked: number } }
interface NftStakingSectionProps {
  account: UiWalletAccount
  userAccount: UserAccountView
  stakeConfig: StakeConfigView
}

export function NftStakingSection({ account, userAccount, stakeConfig }: NftStakingSectionProps) {
  const stakeMutation = useStakeMutation()
  const unstakeMutation = useUnstakeMutation()

  // Fetch wallet assets from DAS
  const assetsQuery = useWalletAssets({ ownerAddress: account.address })

  // Helpers
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Ready to unstake'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  // Child components to evaluate stake status per asset
  function StakedAssetCard({
    asset,
  }: {
    asset: { address: string; name?: string; image?: string; collectionAddress?: string; collectionName?: string }
  }) {
    const stakeStatus = useStakeStatus({
      assetAddress: asset.address as Address,
      freezePeriodSeconds: stakeConfig.data.freezePeriod,
    })
    if (!stakeStatus.data?.staked) return null

    const unlocked = stakeStatus.data?.canUnstake ?? false
    const remaining = stakeStatus.data?.timeRemainingSeconds ?? 0

    return (
      <div key={asset.address} className="border rounded-lg overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-square relative">
          {asset.image ? (
            <img src={asset.image} alt={asset.name ?? asset.address} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-xs p-2 break-all">
              {asset.name ?? asset.address}
            </div>
          )}
          {!unlocked && (
            <div className="absolute top-2 right-2 bg-yellow-500/90 text-white px-2 py-1 rounded text-xs font-medium">
              <Lock className="h-3 w-3 inline mr-1" />
              Locked
            </div>
          )}
          {unlocked && (
            <div className="absolute top-2 right-2 bg-green-500/90 text-white px-2 py-1 rounded text-xs font-medium">
              <Unlock className="h-3 w-3 inline mr-1" />
              Ready
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-1 truncate">{asset.name ?? asset.address}</h3>
          <p className="text-xs text-muted-foreground mb-3 truncate">{asset.collectionName ?? 'Unknown collection'}</p>
          <p className="text-xs text-muted-foreground mb-3">{formatTimeRemaining(remaining)}</p>
          <Button
            onClick={() => handleUnstake(asset.address, asset.collectionAddress ?? '')}
            disabled={!unlocked || unstakeMutation.isPending}
            variant={unlocked ? 'default' : 'secondary'}
            size="sm"
            className="w-full"
          >
            {unstakeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Unstaking...
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-3 w-3" />
                {unlocked ? 'Unstake' : 'Locked'}
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  function AvailableAssetCard({
    asset,
    isMaxStaked,
  }: {
    asset: { address: string; name?: string; image?: string; collectionAddress?: string; collectionName?: string }
    isMaxStaked: boolean
  }) {
    const stakeStatus = useStakeStatus({
      assetAddress: asset.address as Address,
      freezePeriodSeconds: stakeConfig.data.freezePeriod,
    })
    if (stakeStatus.data?.staked) return null

    return (
      <div key={asset.address} className="border rounded-lg overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-square relative">
          {asset.image ? (
            <img src={asset.image} alt={asset.name ?? asset.address} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-xs p-2 break-all">
              {asset.name ?? asset.address}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-1 truncate">{asset.name ?? asset.address}</h3>
          <p className="text-xs text-muted-foreground mb-3 truncate">{asset.collectionName ?? 'Unknown collection'}</p>
          <Button
            onClick={() => handleStake(asset.address, asset.collectionAddress ?? '')}
            disabled={isMaxStaked || stakeMutation.isPending}
            size="sm"
            className="w-full"
          >
            {stakeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Staking...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-3 w-3" />
                Stake NFT
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  const handleStake = (nftAddress: string, collectionAddress: string) => {
    stakeMutation.mutate({ assetAddress: nftAddress as Address, collectionAddress: collectionAddress as Address })
  }

  const handleUnstake = (nftAddress: string, collectionAddress: string) => {
    unstakeMutation.mutate({ assetAddress: nftAddress as Address, collectionAddress: collectionAddress as Address })
  }

  // canUnstake handled by useStakeStatus in StakedAssetCard

  // time remaining handled by useStakeStatus in StakedAssetCard

  const isMaxStaked = userAccount.data.amountStaked >= stakeConfig.data.maxStake

  return (
    <div className="space-y-6">
      {/* Staked NFTs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Staked NFTs</CardTitle>
          <CardDescription>NFTs currently earning rewards. Check the freeze period before unstaking.</CardDescription>
        </CardHeader>
        <CardContent>
          {assetsQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(assetsQuery.data ?? []).map((asset) => (
                <StakedAssetCard key={asset.address} asset={asset} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available NFTs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available NFTs to Stake</CardTitle>
          <CardDescription>
            Select NFTs from your wallet to stake and start earning rewards.
            {isMaxStaked && (
              <span className="block mt-2 text-yellow-600 font-medium">
                ⚠️ Maximum stake limit reached. Unstake some NFTs to stake more.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assetsQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (assetsQuery.data ?? []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No eligible NFTs found in your wallet.</p>
              <p className="text-sm mt-2">Make sure you have NFTs from supported collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(assetsQuery.data ?? []).map((asset) => (
                <AvailableAssetCard key={asset.address} asset={asset} isMaxStaked={isMaxStaked} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

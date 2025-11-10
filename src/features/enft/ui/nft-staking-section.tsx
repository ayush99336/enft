import { UiWalletAccount } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Unlock } from 'lucide-react'
import { useStakeMutation } from '../data-access/use-stake-mutation'
import { useUnstakeMutation } from '../data-access/use-unstake-mutation'
import { useState } from 'react'
import { type Address } from 'gill'

interface NftStakingSectionProps {
  account: UiWalletAccount
  userAccount: any
  stakeConfig: any
}

export function NftStakingSection({ account, userAccount, stakeConfig }: NftStakingSectionProps) {
  const stakeMutation = useStakeMutation()
  const unstakeMutation = useUnstakeMutation()
  const [selectedNft, setSelectedNft] = useState<string | null>(null)

  // Mock NFT data - In production, you would fetch actual NFTs from the user's wallet
  // using DAS API or similar service
  const mockWalletNfts = [
    {
      address: '7K4AxNzHkVKVqZqXkKMVP8wUdGPkHGqW1wKJkJkJkJkJ',
      name: 'Cool NFT #1',
      image: 'https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT+1',
      collection: '5K4AxNzHkVKVqZqXkKMVP8wUdGPkHGqW1wKJkJkJkJkK',
      collectionName: 'Cool Collection',
    },
    {
      address: '8K4AxNzHkVKVqZqXkKMVP8wUdGPkHGqW1wKJkJkJkJkJ',
      name: 'Cool NFT #2',
      image: 'https://via.placeholder.com/300x300/8b5cf6/ffffff?text=NFT+2',
      collection: '5K4AxNzHkVKVqZqXkKMVP8wUdGPkHGqW1wKJkJkJkJkK',
      collectionName: 'Cool Collection',
    },
    {
      address: '9K4AxNzHkVKVqZqXkKMVP8wUdGPkHGqW1wKJkJkJkJkJ',
      name: 'Epic NFT #1',
      image: 'https://via.placeholder.com/300x300/ec4899/ffffff?text=NFT+3',
      collection: '6K4AxNzHkVKVqZqXkKMVP8wUdGPkHGqW1wKJkJkJkJkK',
      collectionName: 'Epic Collection',
    },
  ]

  const mockStakedNfts = [
    {
      address: '6K4AxNzHkVKVqZqXkKMVP8wUdGPkHGqW1wKJkJkJkJkJ',
      name: 'Staked NFT #1',
      image: 'https://via.placeholder.com/300x300/10b981/ffffff?text=Staked+1',
      collection: '5K4AxNzHkVKVqZqXkKMVP8wUdGPkHGqW1wKJkJkJkJkK',
      collectionName: 'Cool Collection',
      stakedAt: Date.now() - 86400000 * 2, // 2 days ago
    },
  ]

  const handleStake = (nftAddress: string, collectionAddress: string) => {
    stakeMutation.mutate({ assetAddress: nftAddress as Address, collectionAddress: collectionAddress as Address })
  }

  const handleUnstake = (nftAddress: string, collectionAddress: string) => {
    unstakeMutation.mutate({ assetAddress: nftAddress as Address, collectionAddress: collectionAddress as Address })
  }

  const canUnstake = (stakedAt: number) => {
    const elapsed = (Date.now() - stakedAt) / 1000
    return elapsed >= stakeConfig.data.freezePeriod
  }

  const getTimeRemaining = (stakedAt: number) => {
    const elapsed = (Date.now() - stakedAt) / 1000
    const remaining = stakeConfig.data.freezePeriod - elapsed
    if (remaining <= 0) return 'Ready to unstake'

    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

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
          {mockStakedNfts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You don't have any staked NFTs yet.</p>
              <p className="text-sm mt-2">Stake NFTs below to start earning rewards!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockStakedNfts.map((nft) => {
                const unlocked = canUnstake(nft.stakedAt)
                return (
                  <div key={nft.address} className="border rounded-lg overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-square relative">
                      <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
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
                      <h3 className="font-semibold text-sm mb-1 truncate">{nft.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 truncate">{nft.collectionName}</p>
                      <p className="text-xs text-muted-foreground mb-3">{getTimeRemaining(nft.stakedAt)}</p>
                      <Button
                        onClick={() => handleUnstake(nft.address, nft.collection)}
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
              })}
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
          {mockWalletNfts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No eligible NFTs found in your wallet.</p>
              <p className="text-sm mt-2">Make sure you have NFTs from supported collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockWalletNfts.map((nft) => (
                <div key={nft.address} className="border rounded-lg overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-square relative">
                    <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 truncate">{nft.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 truncate">{nft.collectionName}</p>
                    <Button
                      onClick={() => handleStake(nft.address, nft.collection)}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

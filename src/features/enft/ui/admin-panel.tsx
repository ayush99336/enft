import { UiWalletAccount } from '@wallet-ui/react'
import { useStakeConfig } from '../data-access/use-stake-config'
import { useEnftInitializeMutation } from '../data-access/use-enft-initialize-mutation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Settings, PlusCircle, Shield } from 'lucide-react'
import { useState } from 'react'

interface AdminPanelProps {
  account: UiWalletAccount
}

export function AdminPanel({ account }: AdminPanelProps) {
  const stakeConfigQuery = useStakeConfig()
  const initializeConfigMutation = useEnftInitializeMutation()

  const [pointsPerStake, setPointsPerStake] = useState('10')
  const [maxStake, setMaxStake] = useState('5')
  const [freezePeriod, setFreezePeriod] = useState('7')

  const [collectionName, setCollectionName] = useState('')
  const [collectionUri, setCollectionUri] = useState('')
  const [nftName, setNftName] = useState('')
  const [nftUri, setNftUri] = useState('')

  const handleInitializeConfig = () => {
    const points = parseInt(pointsPerStake)
    const max = parseInt(maxStake)
    const freeze = parseInt(freezePeriod) * 86400 // Convert days to seconds

    if (isNaN(points) || isNaN(max) || isNaN(freeze)) {
      alert('Please enter valid numbers')
      return
    }

    initializeConfigMutation.mutate({
      pointsPerStake: points,
      maxStake: max,
      freezePeriod: freeze,
    })
  }

  if (stakeConfigQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            <CardTitle>Admin Panel</CardTitle>
          </div>
          <CardDescription>
            Manage staking configuration and collection settings. These actions require admin privileges.
          </CardDescription>
        </CardHeader>
      </Card>

      {!stakeConfigQuery.data ? (
        <Card>
          <CardHeader>
            <CardTitle>Initialize Staking Configuration</CardTitle>
            <CardDescription>
              Set up the initial staking parameters for your NFT staking program. This can only be done once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pointsPerStake">Points Per Stake</Label>
                <Input
                  id="pointsPerStake"
                  type="number"
                  placeholder="10"
                  value={pointsPerStake}
                  onChange={(e) => setPointsPerStake(e.target.value)}
                  min="1"
                  max="255"
                />
                <p className="text-xs text-muted-foreground">
                  Number of reward points earned per staked NFT (1-255)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStake">Maximum Stake Limit</Label>
                <Input
                  id="maxStake"
                  type="number"
                  placeholder="5"
                  value={maxStake}
                  onChange={(e) => setMaxStake(e.target.value)}
                  min="1"
                  max="255"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of NFTs a user can stake at once (1-255)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freezePeriod">Freeze Period (Days)</Label>
                <Input
                  id="freezePeriod"
                  type="number"
                  placeholder="7"
                  value={freezePeriod}
                  onChange={(e) => setFreezePeriod(e.target.value)}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum number of days NFTs must remain staked before unstaking
                </p>
              </div>

              <Button
                onClick={handleInitializeConfig}
                disabled={initializeConfigMutation.isPending}
                size="lg"
                className="w-full"
              >
                {initializeConfigMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing Configuration...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Initialize Staking Config
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
              <CardDescription>Active staking parameters for the program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Points Per Stake</div>
                  <div className="text-2xl font-bold">{stakeConfigQuery.data.data.pointsPerStake}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Max Stake Limit</div>
                  <div className="text-2xl font-bold">{stakeConfigQuery.data.data.maxStake}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Freeze Period</div>
                  <div className="text-2xl font-bold">
                    {stakeConfigQuery.data.data.freezePeriod / 86400} days
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collection Management */}
          <Card>
            <CardHeader>
              <CardTitle>Create NFT Collection</CardTitle>
              <CardDescription>
                Create a new NFT collection for the staking program. Users can mint and stake NFTs from this
                collection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collectionName">Collection Name</Label>
                    <Input
                      id="collectionName"
                      placeholder="My Staking Collection"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      maxLength={32}
                    />
                    <p className="text-xs text-muted-foreground">Max 32 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collectionUri">Collection URI</Label>
                    <Input
                      id="collectionUri"
                      placeholder="https://..."
                      value={collectionUri}
                      onChange={(e) => setCollectionUri(e.target.value)}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">Metadata JSON URI (max 200 chars)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nftName">NFT Name Template</Label>
                    <Input
                      id="nftName"
                      placeholder="My NFT #"
                      value={nftName}
                      onChange={(e) => setNftName(e.target.value)}
                      maxLength={32}
                    />
                    <p className="text-xs text-muted-foreground">Template for NFT names (max 32 chars)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nftUri">NFT URI Template</Label>
                    <Input
                      id="nftUri"
                      placeholder="https://..."
                      value={nftUri}
                      onChange={(e) => setNftUri(e.target.value)}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">NFT metadata URI template (max 200 chars)</p>
                  </div>
                </div>

                <Button
                  disabled
                  size="lg"
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Collection (Coming Soon)
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Collection creation will be available once the create_collection instruction is implemented
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mint NFT Section */}
          <Card>
            <CardHeader>
              <CardTitle>Mint NFT</CardTitle>
              <CardDescription>
                Mint a new NFT from an existing collection. The NFT will be created in the user's wallet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mintCollection">Collection Address</Label>
                  <Input
                    id="mintCollection"
                    placeholder="Collection public key..."
                    disabled
                  />
                </div>

                <Button
                  disabled
                  size="lg"
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Mint NFT (Coming Soon)
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  NFT minting will be available once collections are created
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

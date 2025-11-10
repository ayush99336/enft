import { UiWalletAccount } from '@wallet-ui/react'
import { useUserAccount } from '../data-access/use-user-account'
import { useStakeConfig } from '../data-access/use-stake-config'
import { useInitializeUserMutation } from '../data-access/use-initialize-user-mutation'
import { useClaimMutation } from '../data-access/use-claim-mutation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Coins, Trophy, Lock, TrendingUp } from 'lucide-react'
import { NftStakingSection } from './nft-staking-section'

interface StakingDashboardProps {
  account: UiWalletAccount
}

export function StakingDashboard({ account }: StakingDashboardProps) {
  const userAccountQuery = useUserAccount(account.address)
  const stakeConfigQuery = useStakeConfig()
  const initializeUserMutation = useInitializeUserMutation()
  const claimMutation = useClaimMutation()

  const handleInitializeUser = () => {
    initializeUserMutation.mutate()
  }

  const handleClaim = () => {
    claimMutation.mutate()
  }

  if (userAccountQuery.isLoading || stakeConfigQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stakeConfigQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staking Not Initialized</CardTitle>
          <CardDescription>
            The staking program has not been initialized yet. Please contact the administrator.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!userAccountQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to NFT Staking!</CardTitle>
          <CardDescription>
            Initialize your staking account to start earning rewards from your staked NFTs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleInitializeUser}
            disabled={initializeUserMutation.isPending}
            size="lg"
            className="w-full sm:w-auto"
          >
            {initializeUserMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Initialize Staking Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const userAccount = userAccountQuery.data
  const stakeConfig = stakeConfigQuery.data

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAccount.data.points.toString()}</div>
            <p className="text-xs text-muted-foreground">Available to claim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFTs Staked</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userAccount.data.amountStaked} / {stakeConfig.data.maxStake}
            </div>
            <p className="text-xs text-muted-foreground">Currently staking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Per Stake</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakeConfig.data.pointsPerStake}</div>
            <p className="text-xs text-muted-foreground">Per staked NFT</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Freeze Period</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakeConfig.data.freezePeriod / 86400}</div>
            <p className="text-xs text-muted-foreground">Days lock period</p>
          </CardContent>
        </Card>
      </div>

      {/* Claim Rewards Section */}
      {userAccount.data.points > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Claim Your Rewards</CardTitle>
            <CardDescription>
              You have {userAccount.data.points.toString()} reward points available to claim.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleClaim}
              disabled={claimMutation.isPending}
              size="lg"
              className="w-full sm:w-auto"
            >
              {claimMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Claim {userAccount.data.points.toString()} Points
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* NFT Staking Section */}
      <NftStakingSection account={account} userAccount={userAccount} stakeConfig={stakeConfig} />
    </div>
  )
}

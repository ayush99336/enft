/* Legacy set button removed: staking program does not implement set instruction. */
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useEnftSetMutation } from '@/features/enft/data-access/use-enft-set-mutation'

export function EnftUiButtonSet({ account, enft }: { account: UiWalletAccount; enft: EnftAccount }) {
  return null

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', enft.data.count.toString() ?? '0')
        if (!value || parseInt(value) === enft.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}

import { EnftAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useEnftDecrementMutation } from '../data-access/use-enft-decrement-mutation'

export function EnftUiButtonDecrement({ account, enft }: { account: UiWalletAccount; enft: EnftAccount }) {
  const decrementMutation = useEnftDecrementMutation({ account, enft })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}

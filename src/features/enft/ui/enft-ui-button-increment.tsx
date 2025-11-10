import { EnftAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { useEnftIncrementMutation } from '../data-access/use-enft-increment-mutation'

export function EnftUiButtonIncrement({ account, enft }: { account: UiWalletAccount; enft: EnftAccount }) {
  const incrementMutation = useEnftIncrementMutation({ account, enft })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}

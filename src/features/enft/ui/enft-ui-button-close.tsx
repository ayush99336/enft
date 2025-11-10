import { EnftAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useEnftCloseMutation } from '@/features/enft/data-access/use-enft-close-mutation'

export function EnftUiButtonClose({ account, enft }: { account: UiWalletAccount; enft: EnftAccount }) {
  const closeMutation = useEnftCloseMutation({ account, enft })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}

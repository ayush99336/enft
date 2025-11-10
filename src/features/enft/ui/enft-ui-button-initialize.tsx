import { Button } from '@/components/ui/button'
import { UiWalletAccount } from '@wallet-ui/react'

import { useEnftInitializeMutation } from '@/features/enft/data-access/use-enft-initialize-mutation'

export function EnftUiButtonInitialize({ account }: { account: UiWalletAccount }) {
  const mutationInitialize = useEnftInitializeMutation({ account })

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Enft {mutationInitialize.isPending && '...'}
    </Button>
  )
}

import { EnftUiCard } from './enft-ui-card'
import { useEnftAccountsQuery } from '@/features/enft/data-access/use-enft-accounts-query'
import { UiWalletAccount } from '@wallet-ui/react'

export function EnftUiList({ account }: { account: UiWalletAccount }) {
  const enftAccountsQuery = useEnftAccountsQuery()

  if (enftAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!enftAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {enftAccountsQuery.data?.map((enft) => (
        <EnftUiCard account={account} key={enft.address} enft={enft} />
      ))}
    </div>
  )
}

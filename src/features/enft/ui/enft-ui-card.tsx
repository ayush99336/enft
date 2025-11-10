import { EnftAccount } from '@project/anchor'
import { ellipsify, UiWalletAccount } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { EnftUiButtonClose } from './enft-ui-button-close'
import { EnftUiButtonDecrement } from './enft-ui-button-decrement'
import { EnftUiButtonIncrement } from './enft-ui-button-increment'
import { EnftUiButtonSet } from './enft-ui-button-set'

export function EnftUiCard({ account, enft }: { account: UiWalletAccount; enft: EnftAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enft: {enft.data.count}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={enft.address} label={ellipsify(enft.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <EnftUiButtonIncrement account={account} enft={enft} />
          <EnftUiButtonSet account={account} enft={enft} />
          <EnftUiButtonDecrement account={account} enft={enft} />
          <EnftUiButtonClose account={account} enft={enft} />
        </div>
      </CardContent>
    </Card>
  )
}

import { useQuery } from '@tanstack/react-query'
import { useSolana } from '@/components/solana/use-solana'

export type WalletAsset = {
  address: string
  name?: string
  image?: string
  collectionAddress?: string
  collectionName?: string
  isCompressed?: boolean
  interface?: string
  raw?: unknown
}

type UseWalletAssetsArgs = {
  ownerAddress: string
  collectionAddress?: string
  page?: number
  limit?: number
}

/**
 * Hook to fetch wallet assets from the Solana DAS (Digital Asset Standard) API.
 * - Uses the current cluster from useSolana() to choose the RPC URL.
 * - Optionally filters by collectionAddress.
 * - Returns a simplified list of assets with name/image/collection metadata when available.
 *
 * Notes:
 * - Some public RPC endpoints may not support DAS methods. If you get an RPC error, consider
 *   using an RPC provider with DAS enabled. This hook will surface the RPC error message.
 */
export function useWalletAssets({ ownerAddress, collectionAddress, page = 1, limit = 100 }: UseWalletAssetsArgs) {
  const { clusterId } = useSolana()

  return useQuery({
    queryKey: ['wallet-assets', { clusterId, ownerAddress, collectionAddress, page, limit }],
    queryFn: async ({ signal }) => {
      if (!ownerAddress) return [] as WalletAsset[]

      const url = getDasRpcUrl(clusterId)
      const body = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page,
          limit,
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`DAS RPC HTTP error ${res.status}: ${text || res.statusText}`)
      }

      const json = await res.json().catch(() => ({}))
      if (json?.error) {
        const msg = json.error?.message || 'Unknown DAS RPC error'
        throw new Error(`DAS RPC error: ${msg}`)
      }

      // Different providers may return `items` or `assets`.
      const resultAssets: unknown[] = json?.result?.items ?? json?.result?.assets ?? []

      // Optional filter by collection address (if provided).
      const filtered = collectionAddress
        ? resultAssets.filter((a) => {
            const ca = extractCollectionAddress(a)
            return ca ? ca === collectionAddress : false
          })
        : resultAssets

      return filtered.map((a) => mapDasAsset(a))
    },
  })
}

/**
 * Select a suitable DAS-capable RPC URL based on cluster id.
 * If the current RPC does not support DAS methods, consider switching to a provider that does.
 */
function getDasRpcUrl(clusterId: string | undefined): string {
  switch (clusterId) {
    case 'mainnet':
    case 'mainnet-beta':
      return 'https://api.mainnet-beta.solana.com'
    case 'testnet':
      return 'https://api.testnet.solana.com'
    case 'localnet':
    case 'local':
      return 'http://127.0.0.1:8899'
    case 'devnet':
    default:
      return 'https://api.devnet.solana.com'
  }
}

/**
 * Extracts a collection address for a DAS asset response.
 * Handles common field shapes across different providers.
 */
function extractCollectionAddress(asset: any): string | undefined {
  // DAS grouping array: [{ group_key: 'collection', group_value: '<pubkey>' }]
  const grouping = asset?.grouping ?? asset?.groups ?? []
  const grp = Array.isArray(grouping)
    ? grouping.find(
        (g: any) =>
          (g?.group_key === 'collection' || g?.groupKey === 'collection') &&
          (g?.group_value || g?.groupValue),
      )
    : undefined
  if (grp) {
    return grp.group_value ?? grp.groupValue
  }

  // Some providers may include collection info directly.
  if (asset?.collection?.key || asset?.collection?.id) {
    return asset.collection.key ?? asset.collection.id
  }

  // Fallback: sometimes in "authorities" or "creators" (rarely useful for Core).
  return undefined
}

/**
 * Extracts a collection name if available.
 */
function extractCollectionName(asset: any): string | undefined {
  // Some DAS providers include collection metadata under content or collection object.
  const collection = asset?.collection ?? asset?.grouping?.collection
  if (typeof collection?.name === 'string') return collection.name
  if (typeof collection?.content?.metadata?.name === 'string') return collection.content.metadata.name

  // Sometimes the top-level content includes a collection name in its json.
  const content = asset?.content ?? {}
  const meta = content?.metadata ?? content?.json ?? {}
  if (typeof meta?.collection?.name === 'string') return meta.collection.name

  return undefined
}

/**
 * Maps a DAS asset item into a simplified WalletAsset shape.
 */
function mapDasAsset(asset: any): WalletAsset {
  const address: string = asset?.id ?? asset?.address ?? asset?.pubkey ?? ''
  const content = asset?.content ?? {}
  const meta = content?.metadata ?? content?.json ?? {}
  const links = content?.links ?? {}
  const image = typeof links?.image === 'string' ? links.image : typeof meta?.image === 'string' ? meta.image : undefined

  // Name preference: content.metadata.name or content.json.name or fallback to asset.id prefix.
  const name: string | undefined =
    (typeof meta?.name === 'string' && meta.name) || (typeof content?.name === 'string' && content.name) || undefined

  const collectionAddress = extractCollectionAddress(asset)
  const collectionName = extractCollectionName(asset)

  return {
    address,
    name,
    image,
    collectionAddress,
    collectionName,
    isCompressed: !!asset?.compression?.compressed,
    interface: asset?.interface ?? asset?.standard,
    raw: asset,
  }
}

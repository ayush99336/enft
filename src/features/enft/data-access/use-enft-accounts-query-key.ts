export function useEnftAccountsQueryKey() {
  return ['enft', 'accounts', { removed: true }] as const
}

// Legacy set mutation removed: no corresponding on-chain instruction.
// This hook is kept only to avoid import breakages and will throw if invoked.
export function useEnftSetMutation() {
  throw new Error('Set instruction has been removed from the staking program.')
}

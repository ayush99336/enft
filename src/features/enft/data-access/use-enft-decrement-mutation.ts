// Legacy decrement mutation removed: no corresponding on-chain instruction.
// This hook is kept only to avoid import breakages and will throw if invoked.
export function useEnftDecrementMutation() {
  throw new Error('Decrement instruction has been removed from the staking program.')
}

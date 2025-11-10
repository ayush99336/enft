import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  fetchEnft,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '../src'
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('enft', () => {
  let payer: KeyPairSigner
  let enft: KeyPairSigner

  beforeAll(async () => {
    enft = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Initialize Enft', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getInitializeInstruction({ payer: payer, enft: enft })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSER
    const currentEnft = await fetchEnft(rpc, enft.address)
    expect(currentEnft.data.count).toEqual(0)
  })

  it('Increment Enft', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({
      enft: enft.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchEnft(rpc, enft.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Increment Enft Again', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({ enft: enft.address })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchEnft(rpc, enft.address)
    expect(currentCount.data.count).toEqual(2)
  })

  it('Decrement Enft', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getDecrementInstruction({
      enft: enft.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchEnft(rpc, enft.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Set enft value', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getSetInstruction({ enft: enft.address, value: 42 })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchEnft(rpc, enft.address)
    expect(currentCount.data.count).toEqual(42)
  })

  it('Set close the enft account', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getCloseInstruction({
      payer: payer,
      enft: enft.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    try {
      await fetchEnft(rpc, enft.address)
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toEqual(`Account not found at address: ${enft.address}`)
    }
  })
})

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
  if (latestBlockhash) {
    return latestBlockhash
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value)
}
async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const signedTransaction = await signTransactionMessageWithSigners(tx)
  return await sendAndConfirmTransaction(signedTransaction)
}

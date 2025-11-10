# NFT Staking Platform - Frontend Documentation

## Overview

This is a modern React-based frontend for an NFT staking platform built on Solana. Users can stake their NFTs to earn reward points, which can be claimed as tokens.

## Features

### 🎯 Core Functionality

1. **Staking Dashboard**
   - View reward points balance
   - See number of staked NFTs
   - Track staking statistics
   - Real-time updates

2. **NFT Management**
   - Stake NFTs from your wallet
   - Unstake NFTs (after freeze period)
   - Visual NFT gallery
   - Lock status indicators

3. **Rewards System**
   - Claim accumulated reward points
   - Convert points to tokens
   - Automatic reward calculation

4. **Admin Panel**
   - Initialize staking configuration
   - Set points per stake
   - Configure maximum stake limit
   - Set freeze period
   - Create NFT collections (coming soon)
   - Mint NFTs (coming soon)

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS v4** - Styling
- **gill** - Solana SDK (modern alternative to web3.js)
- **@wallet-ui/react** - Wallet integration
- **@tanstack/react-query** - Data fetching and caching
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icon library
- **Codama** - Program code generation

## Project Structure

```
enft/
├── src/
│   ├── components/          # Shared UI components
│   │   ├── ui/             # Base UI components (button, card, etc.)
│   │   ├── solana/         # Solana-specific components
│   │   └── ...
│   ├── features/           # Feature-based modules
│   │   └── enft/          # NFT staking feature
│   │       ├── data-access/    # API hooks and data fetching
│   │       │   ├── use-stake-config.ts
│   │       │   ├── use-user-account.ts
│   │       │   ├── use-stake-mutation.ts
│   │       │   ├── use-unstake-mutation.ts
│   │       │   └── use-claim-mutation.ts
│   │       └── ui/             # UI components
│   │           ├── staking-dashboard.tsx
│   │           ├── nft-staking-section.tsx
│   │           └── admin-panel.tsx
│   └── ...
└── anchor/
    └── src/
        └── client/
            └── js/
                └── generated/  # Auto-generated from Anchor program
                    ├── accounts/
                    ├── instructions/
                    └── programs/
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm, yarn, or npm
- Solana CLI
- Anchor CLI

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Build the Anchor program:
```bash
pnpm anchor-build
```

3. Generate TypeScript client code:
```bash
pnpm codama:js
```

4. Start local Solana validator:
```bash
solana-test-validator
```

5. Deploy the program (in another terminal):
```bash
cd anchor && anchor deploy
```

6. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## Architecture

### Data Flow

1. **User Actions** → UI Components
2. **UI Components** → Data Access Hooks (React Query mutations)
3. **Mutations** → Solana Instructions (via Codama-generated code)
4. **Instructions** → On-chain Program
5. **Program Response** → Cache Invalidation → UI Update

### State Management

- **React Query** for server state (blockchain data)
- **Local State** (useState) for UI-only state
- **Jotai** available for global client state if needed

### Key Hooks

#### Data Fetching
- `useStakeConfig()` - Fetch staking configuration
- `useUserAccount(address)` - Fetch user staking account
- `useCollectionInfo(address)` - Fetch collection metadata

#### Mutations
- `useEnftInitializeMutation()` - Initialize staking config (admin)
- `useInitializeUserMutation()` - Initialize user staking account
- `useStakeMutation()` - Stake an NFT
- `useUnstakeMutation()` - Unstake an NFT
- `useClaimMutation()` - Claim reward points

## Component Guide

### StakingDashboard

Main dashboard showing user's staking status, rewards, and statistics.

**Props:**
- `account: UiWalletAccount` - Connected wallet account

**Features:**
- Stats cards (points, staked NFTs, etc.)
- Claim rewards button
- NFT staking section

### NftStakingSection

Displays user's NFTs and allows staking/unstaking.

**Props:**
- `account: UiWalletAccount` - Connected wallet
- `userAccount: any` - User's staking account data
- `stakeConfig: any` - Global staking configuration

**Features:**
- Grid view of wallet NFTs
- Grid view of staked NFTs
- Stake/unstake actions
- Lock status indicators
- Freeze period countdown

### AdminPanel

Admin interface for program configuration.

**Props:**
- `account: UiWalletAccount` - Connected wallet (must be admin)

**Features:**
- Initialize staking config
- View current configuration
- Create collections (planned)
- Mint NFTs (planned)

## Styling

The project uses TailwindCSS v4 with a custom design system:

- **Colors:** Primary, secondary, accent, muted variants
- **Components:** Built with Radix UI primitives
- **Dark Mode:** Supported via next-themes
- **Responsive:** Mobile-first approach

### Theme Customization

Edit `src/index.css` to customize the theme:

```css
@theme {
  --color-primary: /* your color */;
  --radius: /* border radius */;
}
```

## Program Integration

### Codama Code Generation

The project uses Codama to automatically generate TypeScript clients from the Anchor IDL:

```bash
pnpm codama:js
```

This generates:
- Account decoders/encoders
- Instruction builders
- Type definitions
- PDA helpers

### Generated Code Location

All generated code is in:
```
anchor/src/client/js/generated/
```

**Import from:** `@project/anchor`

Example:
```typescript
import {
  ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
  getClaimInstructionAsync,
  fetchStakeConfig,
} from '@project/anchor'
```

## Transaction Building

Transactions are built using the gill SDK:

```typescript
// 1. Create instruction
const instruction = await getClaimInstructionAsync({
  user: account,
  config: configPda,
  userAccount: userAccountPda,
  rewardMint: rewardMintPda,
})

// 2. Get latest blockhash
const { value: latestBlockhash } = await client.rpc
  .getLatestBlockhash()
  .send()

// 3. Build transaction message
const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => setTransactionMessageFeePayer(account.address, tx),
  (tx) => appendTransactionMessageInstruction(instruction, tx),
)

// 4. Sign and send
const signedTransaction = await signTransactionMessageWithSigners(
  transactionMessage
)
const signature = await client.rpc
  .sendTransaction(signedTransaction, { encoding: 'base64' })
  .send()
```

## PDA Derivation

Program Derived Addresses (PDAs) are computed using the gill SDK:

```typescript
import { getProgramDerivedAddress } from 'gill'

// Config PDA
const [configPda] = await getProgramDerivedAddress({
  programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
  seeds: [new TextEncoder().encode('config')],
})

// User Account PDA
const [userAccountPda] = await getProgramDerivedAddress({
  programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
  seeds: [
    new TextEncoder().encode('user'),
    userAddress,
  ],
})

// Stake Account PDA
const [stakeAccountPda] = await getProgramDerivedAddress({
  programAddress: ANCHOR_NFT_STAKING_Q425_PROGRAM_ADDRESS,
  seeds: [
    new TextEncoder().encode('stake'),
    assetAddress,
  ],
})
```

## Current Limitations & TODOs

### Mock Data
⚠️ Currently using mock NFT data in `NftStakingSection`. To integrate real NFTs:

1. **Install DAS API client:**
```bash
pnpm add @metaplex-foundation/digital-asset-standard-api
```

2. **Fetch user's NFTs:**
```typescript
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api'

const umi = createUmi(rpcUrl).use(dasApi())
const assets = await umi.rpc.getAssetsByOwner({ owner: userAddress })
```

3. **Replace mock data** in `nft-staking-section.tsx`

### Features to Implement

- [ ] Real NFT fetching from user wallet
- [ ] Collection creation UI
- [ ] NFT minting interface
- [ ] Transaction history
- [ ] Rewards calculation display
- [ ] APY calculator
- [ ] Leaderboard
- [ ] Notification system
- [ ] Multi-collection support
- [ ] Batch staking/unstaking
- [ ] Mobile optimization

### Error Handling

- [ ] Add retry logic for failed transactions
- [ ] Better error messages
- [ ] Transaction status tracking
- [ ] Confirmation modals

## Environment Variables

Create a `.env` file:

```env
VITE_RPC_URL=http://localhost:8899
VITE_NETWORK=localnet
```

## Scripts

```json
{
  "dev": "vite",                          // Start dev server
  "build": "tsc -b && vite build",        // Production build
  "preview": "vite preview",              // Preview production build
  "anchor-build": "cd anchor && anchor build",  // Build Anchor program
  "codama:js": "codama run js -c ./anchor/codama.js",  // Generate TS client
  "setup": "npm run anchor keys sync && npm run anchor build && npm run codama:js"
}
```

## Deployment

### Build for Production

```bash
pnpm build
```

Output will be in `dist/` directory.

### Deploy to Vercel/Netlify

1. Connect your GitHub repository
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Add environment variables for mainnet/devnet

### Update Program Address

After deploying to mainnet/devnet:

1. Update program ID in `anchor/programs/enft/src/lib.rs`
2. Rebuild: `pnpm anchor-build`
3. Regenerate client: `pnpm codama:js`
4. Update RPC URLs in environment variables

## Testing

### Unit Tests (Coming Soon)

```bash
pnpm test
```

### E2E Tests (Coming Soon)

```bash
pnpm test:e2e
```

## Troubleshooting

### "Program not found" Error
- Make sure the local validator is running
- Deploy the program: `cd anchor && anchor deploy`
- Check the program address matches in your code

### "User account not initialized"
- User must click "Initialize Staking Account" first
- This creates their user PDA account

### Transaction Failures
- Check you have enough SOL for rent + fees
- Verify all PDAs are correctly derived
- Check freeze period hasn't expired for unstaking

### TypeScript Errors
- Regenerate client code: `pnpm codama:js`
- Clear node_modules and reinstall
- Check tsconfig.json paths are correct

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly on localnet
4. Submit a pull request

## Resources

- [Solana Documentation](https://docs.solana.com)
- [Anchor Documentation](https://www.anchor-lang.com)
- [gill SDK](https://github.com/solana-program/gill)
- [Wallet UI](https://github.com/wallet-ui/wallet-ui)
- [Codama Documentation](https://github.com/codama-idl/codama)
- [Radix UI](https://www.radix-ui.com)
- [TailwindCSS](https://tailwindcss.com)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");

#[program]
pub mod enft {
    use super::*;

    pub fn close(_ctx: Context<CloseEnft>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.enft.count = ctx.accounts.enft.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.enft.count = ctx.accounts.enft.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeEnft>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.enft.count = value.clone();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeEnft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Enft::INIT_SPACE,
  payer = payer
    )]
    pub enft: Account<'info, Enft>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseEnft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
    )]
    pub enft: Account<'info, Enft>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub enft: Account<'info, Enft>,
}

#[account]
#[derive(InitSpace)]
pub struct Enft {
    count: u8,
}

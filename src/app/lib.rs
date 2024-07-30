use anchor_lang::prelude::*;

declare_id!("6XookqjXLBqTWk2Zom4grnPu8ZMLRfVCwHoS7oumJJ3j");

#[program]
pub mod learning_tracker {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.learning_time = 0;
        user.points = 0;
        msg!("User initialized with 0 learning time and 0 points.");
        Ok(())
    }

    pub fn add_learning_time(ctx: Context<AddLearningTime>, minutes: u64) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.learning_time += minutes;
        user.points += minutes / 10; // 10分ごとに1ポイント
        msg!("Added {} minutes of learning time. Total time: {}. Total points: {}.",
            minutes, user.learning_time, user.points);
        Ok(())
    }

    pub fn use_points_for_content(ctx: Context<UsePoints>, points: u64) -> Result<()> {
        let user = &mut ctx.accounts.user;
        if user.points >= points {
            user.points -= points;
            msg!("Special content unlocked! {} points used. Remaining points: {}.",
                points, user.points);
            Ok(())
        } else {
            Err(ErrorCode::InsufficientPoints.into())
        }
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = user_wallet,
        space = 8 + 8 + 8,
        seeds = [b"user", user_wallet.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub user_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddLearningTime<'info> {
    #[account(
        mut,
        seeds = [b"user", user_wallet.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    pub user_wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct UsePoints<'info> {
    #[account(
        mut,
        seeds = [b"user", user_wallet.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    pub user_wallet: Signer<'info>,
}

#[account]
pub struct User {
    pub learning_time: u64,
    pub points: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient points for this action.")]
    InsufficientPoints,
}

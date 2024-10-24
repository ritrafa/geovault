use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("7n54hP2KnNHvC1KqQnBbJzy45B1bQsWmgApQdSy1ABaL");

#[program]
pub mod real_estate_crowdfunding {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, role: UserRole) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.role = role;
        user_account.pubkey = ctx.accounts.user.key();
        Ok(())
    }

    pub fn update_user_role(ctx: Context<UpdateUserRole>, new_role: UserRole) -> Result<()> {
        require!(
            ctx.accounts.admin_account.role == UserRole::Admin,
            ErrorCode::UnauthorizedRole
        );
        ctx.accounts.target_user_account.role = new_role;
        Ok(())
    }

    pub fn create_property(
        ctx: Context<CreateProperty>,
        initial_valuation: u64,
        token_supply: u64,
        lock_period: u8,
    ) -> Result<()> {
        require!(
            ctx.accounts.manager_account.role == UserRole::PropertyManager,
            ErrorCode::UnauthorizedRole
        );

        let property = &mut ctx.accounts.property;
        property.manager = ctx.accounts.manager.key();
        property.initial_valuation = initial_valuation;
        property.current_valuation = initial_valuation;
        property.token_supply = token_supply;
        property.lock_period = lock_period;
        property.is_active = true;
        property.is_frozen = true;
        property.unclaimed_disbursement = 0;
        property.claimed_disbursement = 0;
        Ok(())
    }

    pub fn start_funding(ctx: Context<FundingControl>) -> Result<()> {
        require!(
            ctx.accounts.property.manager == ctx.accounts.manager.key(),
            ErrorCode::UnauthorizedManager
        );
        ctx.accounts.property.is_frozen = true;
        Ok(())
    }

    pub fn complete_funding(ctx: Context<FundingControl>) -> Result<()> {
        require!(
            ctx.accounts.property.manager == ctx.accounts.manager.key(),
            ErrorCode::UnauthorizedManager
        );
        ctx.accounts.property.is_frozen = false;
        Ok(())
    }

    pub fn update_valuation(ctx: Context<UpdateValuation>, new_valuation: u64) -> Result<()> {
        require!(
            ctx.accounts.property.manager == ctx.accounts.manager.key(),
            ErrorCode::UnauthorizedManager
        );
        ctx.accounts.property.current_valuation = new_valuation;
        Ok(())
    }

    pub fn invest_in_property(ctx: Context<InvestInProperty>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.property.is_frozen,
            ErrorCode::PropertyNotFrozen
        );

        let binding = ctx.accounts.token_mint.key();
        let seeds = &[b"property", binding.as_ref(), &[ctx.bumps.property]];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.investor_token_account.to_account_info(),
                    authority: ctx.accounts.property.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn create_disbursement(ctx: Context<CreateDisbursement>, total_amount: u64) -> Result<()> {
        require!(
            ctx.accounts.property.manager == ctx.accounts.manager.key(),
            ErrorCode::UnauthorizedManager
        );

        let disbursement = &mut ctx.accounts.disbursement;
        disbursement.property = ctx.accounts.property.key();
        disbursement.token_mint = ctx.accounts.old_token_mint.key();
        disbursement.new_token_mint = ctx.accounts.new_token_mint.key();
        disbursement.total_amount = total_amount;

        ctx.accounts.property.unclaimed_disbursement += total_amount;
        Ok(())
    }

    pub fn convert_tokens(ctx: Context<ConvertTokens>, amount: u64) -> Result<()> {
        // Burn old tokens
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Burn {
                mint: ctx.accounts.old_token_mint.to_account_info(),
                from: ctx.accounts.user_old_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::burn(burn_ctx, amount)?;

        // Mint new tokens using disbursement PDA as signer
        let binding_token = ctx.accounts.new_token_mint.key();
        let binding_property = ctx.accounts.property.key();
        let seeds = &[
            b"disbursement",
            binding_property.as_ref(),
            binding_token.as_ref(),
            &[ctx.bumps.disbursement],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.new_token_mint.to_account_info(),
                    to: ctx.accounts.user_new_token_account.to_account_info(),
                    authority: ctx.accounts.disbursement.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        // Update disbursement tracking
        ctx.accounts.property.unclaimed_disbursement -= amount;
        ctx.accounts.property.claimed_disbursement += amount;
        Ok(())
    }
}

// Account Structures
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum UserRole {
    User,
    PropertyManager,
    Admin,
}

#[account]
pub struct UserAccount {
    pub pubkey: Pubkey,
    pub role: UserRole,
}

#[account]
pub struct Property {
    pub manager: Pubkey,
    pub initial_valuation: u64,
    pub current_valuation: u64,
    pub token_supply: u64,
    pub lock_period: u8,
    pub is_active: bool,
    pub is_frozen: bool,
    pub unclaimed_disbursement: u64,
    pub claimed_disbursement: u64,
}

#[account]
pub struct Disbursement {
    pub property: Pubkey,
    pub token_mint: Pubkey,
    pub new_token_mint: Pubkey,
    pub total_amount: u64,
}

// Context Structs
#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(
        init, 
        payer = user, 
        seeds = [b"user", user.key().as_ref()], 
        bump, 
        space = 8 + 32 + 8
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUserRole<'info> {
    #[account(mut)]
    pub target_user_account: Account<'info, UserAccount>,
    pub admin_account: Account<'info, UserAccount>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateProperty<'info> {
    #[account(
        init, 
        payer = manager, 
        seeds = [b"property", token_mint.key().as_ref()], 
        bump, 
        space = 8 + 32 + 8 + 8 + 8 + 1 + 1 + 1 + 8 + 8
    )]
    pub property: Account<'info, Property>,
    pub manager_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub manager: Signer<'info>,
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundingControl<'info> {
    #[account(mut)]
    pub property: Account<'info, Property>,
    #[account(mut)]
    pub manager: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateValuation<'info> {
    #[account(mut)]
    pub property: Account<'info, Property>,
    #[account(mut)]
    pub manager: Signer<'info>,
}

#[derive(Accounts)]
pub struct InvestInProperty<'info> {
    #[account(
        mut,
        seeds = [b"property", token_mint.key().as_ref()],
        bump,
    )]
    pub property: Account<'info, Property>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub investor_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub investor: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateDisbursement<'info> {
    #[account(
        init, 
        payer = manager, 
        seeds = [b"disbursement", property.key().as_ref(), new_token_mint.key().as_ref()], 
        bump, 
        space = 8 + 32 + 32 + 32 + 8
    )]
    pub disbursement: Account<'info, Disbursement>,
    #[account(mut)]
    pub property: Account<'info, Property>,
    pub old_token_mint: Account<'info, Mint>,
    pub new_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub manager: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConvertTokens<'info> {
    #[account(
        mut,
        seeds = [b"disbursement", property.key().as_ref(), new_token_mint.key().as_ref()],
        bump,
    )]
    pub disbursement: Account<'info, Disbursement>,
    #[account(mut)]
    pub property: Account<'info, Property>,
    #[account(mut)]
    pub old_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub new_token_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = user_old_token_account.mint == old_token_mint.key(),
        constraint = user_old_token_account.owner == user.key()
    )]
    pub user_old_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = user_new_token_account.mint == new_token_mint.key(),
        constraint = user_new_token_account.owner == user.key()
    )]
    pub user_new_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized role for this action")]
    UnauthorizedRole,
    #[msg("Unauthorized property manager")]
    UnauthorizedManager,
    #[msg("Property not in frozen state")]
    PropertyNotFrozen,
}

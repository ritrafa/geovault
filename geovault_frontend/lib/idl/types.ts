import { Program, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { IDL } from "./real_estate_crowdfunding";

export type RealEstateCrowdfunding = Program<typeof IDL>;

export type RealEstateCrowdfundingIDL = typeof IDL & Idl;

export interface UserRole {
  user?: Record<string, never>;
  propertyManager?: Record<string, never>;
  admin?: Record<string, never>;
}

export interface UserAccount {
  pubkey: PublicKey;
  role: UserRole;
}

export interface Property {
  manager: PublicKey;
  initialValuation: BN;
  currentValuation: BN;
  tokenSupply: BN;
  lockPeriod: number;
  isActive: boolean;
  isFrozen: boolean;
  unclaimedDisbursement: BN;
  claimedDisbursement: BN;
}

export interface Disbursement {
  property: PublicKey;
  tokenMint: PublicKey;
  newTokenMint: PublicKey;
  totalAmount: BN;
}

// Add helper types for account fetching
export type AccountWithPublicKey<T> = {
  publicKey: PublicKey;
  account: T;
};

export type PropertyWithPublicKey = AccountWithPublicKey<Property>;
export type UserAccountWithPublicKey = AccountWithPublicKey<UserAccount>;
export type DisbursementWithPublicKey = AccountWithPublicKey<Disbursement>;

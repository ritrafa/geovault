import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { AnchorProvider, Program, BN, Wallet } from "@coral-xyz/anchor";
import {
  IDL,
  RealEstateCrowdfundingIDL,
  RealEstateCrowdfunding,
  Property,
  UserAccount,
  Disbursement,
} from "./idl";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
} from "@solana/spl-token";

export const PROGRAM_ID = new PublicKey(
  "7n54hP2KnNHvC1KqQnBbJzy45B1bQsWmgApQdSy1ABaL"
);

export class SolanaUtils {
  private connection: Connection;
  private program: RealEstateCrowdfunding;
  private provider: AnchorProvider;
  private userPublicKey: PublicKey;
  private userWallet: Wallet;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(IDL as RealEstateCrowdfundingIDL, this.provider);
    this.userPublicKey = wallet.publicKey;
    this.userWallet = wallet;
  }

  // User Account Management
  async createUserAccount(
    role: "user" | "propertyManager" | "admin"
  ): Promise<string> {
    const [userAccount] = await PublicKey.findProgramAddress(
      [Buffer.from("user"), this.userPublicKey.toBuffer()],
      PROGRAM_ID
    );

    const roleEnum = {
      user: { user: {} },
      propertyManager: { propertyManager: {} },
      admin: { admin: {} },
    }[role];

    const tx = await this.program.methods
      .createUser(roleEnum)
      .accounts({
        userAccount,
        user: this.userPublicKey, // User is payer
        systemProgram: PublicKey.default,
      })
      .rpc();

    return tx;
  }

  // Property Management
  async createProperty(
    initialValuation: number,
    tokenSupply: number,
    lockPeriod: number,
    mintKeypair: Keypair // Pass in the mint keypair
  ): Promise<{ tx: string; propertyAddress: PublicKey; tokenMint: PublicKey }> {
    const tokenMint = mintKeypair.publicKey;

    const [property] = await PublicKey.findProgramAddress(
      [Buffer.from("property"), tokenMint.toBuffer()],
      PROGRAM_ID
    );

    const tx = await this.program.methods
      .createProperty(new BN(initialValuation), new BN(tokenSupply), lockPeriod)
      .accounts({
        property,
        managerAccount: this.userPublicKey,
        manager: this.userPublicKey, // Manager is payer
        tokenMint,
        systemProgram: PublicKey.default,
      })
      .signers([mintKeypair]) // Include mint keypair in signers
      .rpc();

    return { tx, propertyAddress: property, tokenMint };
  }

  // Investment Operations
  async investInProperty(
    property: PublicKey,
    tokenMint: PublicKey,
    amount: number
  ): Promise<string> {
    // Get or create investor's token account
    const investorTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      this.userPublicKey
    );

    // Create ATA if it doesn't exist
    try {
      await createAssociatedTokenAccount(
        this.connection,
        this.userWallet.payer,
        tokenMint,
        this.userPublicKey // owner
      );
    } catch (e) {
      // Account already exists, continue
    }

    const tx = await this.program.methods
      .investInProperty(new BN(amount))
      .accounts({
        property,
        tokenMint,
        investorTokenAccount,
        investor: this.userPublicKey, // Investor is payer
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  async createDisbursement(
    property: PublicKey,
    oldTokenMint: PublicKey,
    newMintKeypair: Keypair,
    amount: number
  ): Promise<{ tx: string; newTokenMint: PublicKey }> {
    const [disbursement] = await PublicKey.findProgramAddress(
      [
        Buffer.from("disbursement"),
        property.toBuffer(),
        newMintKeypair.publicKey.toBuffer(),
      ],
      PROGRAM_ID
    );

    const tx = await this.program.methods
      .createDisbursement(new BN(amount))
      .accounts({
        disbursement,
        property,
        oldTokenMint,
        newTokenMint: newMintKeypair.publicKey,
        manager: this.userPublicKey,
        systemProgram: PublicKey.default,
      })
      .signers([newMintKeypair])
      .rpc();

    return { tx, newTokenMint: newMintKeypair.publicKey };
  }

  async convertTokens(
    disbursement: PublicKey,
    property: PublicKey,
    oldTokenMint: PublicKey,
    newTokenMint: PublicKey,
    amount: number
  ): Promise<string> {
    // Get or create token accounts
    const oldTokenAccount = await getAssociatedTokenAddress(
      oldTokenMint,
      this.userPublicKey
    );
    const newTokenAccount = await getAssociatedTokenAddress(
      newTokenMint,
      this.userPublicKey
    );

    // Create new token account if needed
    try {
      await createAssociatedTokenAccount(
        this.connection,
        this.userWallet.payer,
        newTokenMint,
        this.userPublicKey // owner
      );
    } catch (e) {
      // Account already exists, continue
    }

    const tx = await this.program.methods
      .convertTokens(new BN(amount))
      .accounts({
        disbursement,
        property,
        oldTokenMint,
        newTokenMint,
        userOldTokenAccount: oldTokenAccount,
        userNewTokenAccount: newTokenAccount,
        user: this.userPublicKey, // User is payer
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  // Query Functions still in development
  /*
  async getPropertyDetails(property: PublicKey): Promise<Property> {
    return (await this.program.account.property.fetch(
      property
    )) as unknown as Property;
  }

  async getUserAccount(userAddress: PublicKey) {
    const [userAccount] = await PublicKey.findProgramAddressSync(
      [Buffer.from("user"), userAddress.toBuffer()],
      PROGRAM_ID
    );
    return await this.program.account.userAccount.fetch(userAccount);
  }

  async getDisbursementDetails(disbursement: PublicKey) {
    return await this.program.account.disbursement.fetch(disbursement);
  }

  async getAllProperties(): Promise<
    { publicKey: PublicKey; account: Property }[]
  > {
    const properties = await this.program.account.property.all();
    return properties as unknown as {
      publicKey: PublicKey;
      account: Property;
    }[];
  }

  async getUserInvestedProperties(
    userWallet: PublicKey
  ): Promise<{ publicKey: PublicKey; account: Property }[]> {
    const properties = await this.program.account.property.all();
    return properties as unknown as {
      publicKey: PublicKey;
      account: Property;
    }[];
  }
*/
}

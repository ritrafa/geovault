import BN from "bn.js";
import assert from "assert";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RealEstateCrowdfunding } from "../target/types/real_estate_crowdfunding";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  getMint,
} from "@solana/spl-token";
import assert from "assert";
import type { RealEstateCrowdfunding } from "../target/types/real_estate_crowdfunding";

function busyWait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
      // Busy loop
    }
    resolve();
  });
}

const getPdaParams = async (programId: PublicKey) => {
  return {
    userSeedPrefix: Buffer.from("user"),
    propertySeedPrefix: Buffer.from("property"),
    disbursementSeedPrefix: Buffer.from("disbursement"),
  };
};

describe("real_estate_crowdfunding", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.RealEstateCrowdfunding as anchor.Program<RealEstateCrowdfunding>;
  
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .RealEstateCrowdfunding as Program<RealEstateCrowdfunding>;

  // Test users
  const admin = Keypair.generate();
  const propertyManager = Keypair.generate();
  const investor = Keypair.generate();

  // Recipient wallet for cleanup
  const RECIPIENT_WALLET = new PublicKey(
    "BHvKfNUBG5LkomT17E2Gxkni9L9xWne4uVUen68j1zED"
  );

  // Test accounts
  let adminAccount: PublicKey;
  let managerAccount: PublicKey;
  let investorAccount: PublicKey;
  let property: PublicKey;
  let propertyTokenMint: PublicKey;
  let investorTokenAccount: PublicKey;
  let disbursement: PublicKey;
  let newTokenMint: PublicKey;

  before(async () => {
    console.log("Setting up test accounts...");

    // Fund test accounts from wallet
    const fundAccounts = async () => {
      const fundAmount = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL each
      const accounts = [admin, propertyManager, investor];

      for (const account of accounts) {
        try {
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: provider.wallet.publicKey,
              toPubkey: account.publicKey,
              lamports: fundAmount,
            })
          );

          const signature = await provider.sendAndConfirm(transaction);
          console.log(
            `Funded ${account.publicKey.toString()} with ${
              fundAmount / LAMPORTS_PER_SOL
            } SOL: ${signature}`
          );
        } catch (error) {
          console.error(
            `Error funding ${account.publicKey.toString()}:`,
            error
          );
          throw error;
        }
      }
    };

    await fundAccounts();
    // Wait for confirmation
    busyWait(2000);
  });

  it("Creates user accounts with different roles", async () => {
    const seeds = await getPdaParams(program.programId);

    try {
      // Create admin account with PDA
      const [adminAccountPda, adminBump] =
        await PublicKey.findProgramAddressSync(
          [seeds.userSeedPrefix, admin.publicKey.toBuffer()],
          program.programId
        );
      adminAccount = adminAccountPda;

      const createAdminTx = await program.methods
        .createUser({ admin: {} })
        .accounts({
          userAccount: adminAccount,
          user: admin.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      console.log("Admin account created:", createAdminTx);

      // Create property manager account
      const [managerAccountPda, managerBump] =
        await PublicKey.findProgramAddressSync(
          [seeds.userSeedPrefix, propertyManager.publicKey.toBuffer()],
          program.programId
        );
      managerAccount = managerAccountPda;

      const createManagerTx = await program.methods
        .createUser({ propertyManager: {} })
        .accounts({
          userAccount: managerAccount,
          user: propertyManager.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([propertyManager])
        .rpc();

      console.log("Manager account created:", createManagerTx);

      // Create investor account
      const [investorAccountPda, investorBump] =
        await PublicKey.findProgramAddressSync(
          [seeds.userSeedPrefix, investor.publicKey.toBuffer()],
          program.programId
        );
      investorAccount = investorAccountPda;

      const createInvestorTx = await program.methods
        .createUser({ user: {} })
        .accounts({
          userAccount: investorAccount,
          user: investor.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investor])
        .rpc();

      console.log("Investor account created:", createInvestorTx);

      // Verify accounts
      const adminAcct = await program.account.userAccount.fetch(adminAccount);
      const managerAcct = await program.account.userAccount.fetch(
        managerAccount
      );
      const investorAcct = await program.account.userAccount.fetch(
        investorAccount
      );

      assert(
        adminAcct.role.admin !== undefined,
        "Admin role not set correctly"
      );
      assert(
        managerAcct.role.propertyManager !== undefined,
        "Property Manager role not set correctly"
      );
      assert(
        investorAcct.role.user !== undefined,
        "User role not set correctly"
      );
    } catch (err) {
      console.log("Create user error details:", err);
      throw err;
    }
  });

  it("Creates a new property", async () => {
    try {
      // Verify manager account exists
      const managerAcct = await program.account.userAccount.fetch(
        managerAccount
      );
      console.log("Manager account verified:", managerAcct);

      // First create the mint
      const mintKeypair = Keypair.generate();
      propertyTokenMint = mintKeypair.publicKey;

      // Derive property PDA - this will be our mint authority
      const [propertyPda, propertyBump] =
        await PublicKey.findProgramAddressSync(
          [Buffer.from("property"), propertyTokenMint.toBuffer()],
          program.programId
        );
      property = propertyPda;

      // Create mint with property PDA as authority
      const createMintTx = await createMint(
        provider.connection,
        propertyManager, // payer
        property, // mint authority (the PDA)
        null, // freeze authority
        9, // decimals
        mintKeypair // mint keypair
      );
      console.log("Property token mint created:", propertyTokenMint.toBase58());

      const createPropertyTx = await program.methods
        .createProperty(new anchor.BN(1000), new anchor.BN(100), 12)
        .accounts({
          property,
          managerAccount,
          manager: propertyManager.publicKey,
          tokenMint: propertyTokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([propertyManager])
        .rpc();

      console.log("Property created:", createPropertyTx);

      // Verify property
      const propertyData = await program.account.property.fetch(property);
      assert(
        propertyData.manager.equals(propertyManager.publicKey),
        "Manager not set correctly"
      );
      assert(propertyData.isFrozen, "Property should be frozen initially");
      assert(
        propertyData.tokenSupply.toString() === "100",
        "Token supply not set correctly"
      );
    } catch (err) {
      console.log("Create property error details:", err);
      throw err;
    }
  });

  it("Allows investment during funding period", async () => {
    try {
      // Create the investor's token account
      investorTokenAccount = await createAccount(
        provider.connection,
        investor,
        propertyTokenMint,
        investor.publicKey
      );
      console.log(
        "Investor token account created:",
        investorTokenAccount.toBase58()
      );

      // Get property PDA and bump
      const [propertyPda, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from("property"), propertyTokenMint.toBuffer()],
        program.programId
      );
      property = propertyPda;

      console.log(
        "Using property PDA:",
        propertyPda.toBase58(),
        "with bump:",
        bump
      );

      // Verify current mint authority
      const mintInfo = await getMint(provider.connection, propertyTokenMint);
      console.log(
        "Current mint authority:",
        mintInfo.mintAuthority?.toBase58()
      );

      // Verify property state
      const propertyData = await program.account.property.fetch(property);
      console.log("Property state:", {
        isFrozen: propertyData.isFrozen,
        manager: propertyData.manager.toBase58(),
      });

      // Make the investment
      const tx = await program.methods
        .investInProperty(new anchor.BN(10))
        .accounts({
          property,
          tokenMint: propertyTokenMint,
          investorTokenAccount,
          investor: investor.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investor])
        .rpc();

      console.log("Investment transaction:", tx);

      // Verify the investment
      await provider.connection.confirmTransaction(tx);
      const tokenBalance = await provider.connection.getTokenAccountBalance(
        investorTokenAccount
      );
      console.log("Token balance after investment:", tokenBalance.value.amount);
      assert.equal(tokenBalance.value.amount, "10");
    } catch (err) {
      console.log("Investment error details:", err);
      if (err instanceof anchor.AnchorError) {
        console.log("Error program:", err.program);
        console.log("Error code:", err.error.code);
        console.log("Error msg:", err.error.msg);
      }
      throw err;
    }
  });

  it("Completes funding period", async () => {
    await program.methods
      .completeFunding()
      .accounts({
        property,
        manager: propertyManager.publicKey,
      })
      .signers([propertyManager])
      .rpc();

    const propertyData = await program.account.property.fetch(property);
    assert.ok(!propertyData.isFrozen);
  });

  it("Updates property valuation", async () => {
    await program.methods
      .updateValuation(new anchor.BN(1200)) // Small number for testing
      .accounts({
        property,
        manager: propertyManager.publicKey,
      })
      .signers([propertyManager])
      .rpc();

    const propertyData = await program.account.property.fetch(property);
    assert.equal(propertyData.currentValuation.toString(), "1200");
  });

  it("Creates a disbursement", async () => {
    // Create new token mint
    const newMintKeypair = Keypair.generate();
    newTokenMint = newMintKeypair.publicKey;

    // Get disbursement PDA
    const [disbursementPda, disbursementBump] =
      await PublicKey.findProgramAddressSync(
        [
          Buffer.from("disbursement"),
          property.toBuffer(),
          newTokenMint.toBuffer(),
        ],
        program.programId
      );
    disbursement = disbursementPda;

    // Create new mint with disbursement as authority
    await createMint(
      provider.connection,
      propertyManager,
      disbursement,
      null,
      9,
      newMintKeypair
    );

    await program.methods
      .createDisbursement(new anchor.BN(50))
      .accounts({
        disbursement,
        property,
        oldTokenMint: propertyTokenMint,
        newTokenMint,
        manager: propertyManager.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([propertyManager])
      .rpc();

    const disbursementData = await program.account.disbursement.fetch(
      disbursement
    );
    assert.ok(disbursementData.property.equals(property));
    assert.equal(disbursementData.totalAmount.toString(), "50");
  });

  it("Converts tokens to claim disbursement", async () => {
    try {
      // Create new token account for the new version
      const investorNewTokenAccount = await createAccount(
        provider.connection,
        investor,
        newTokenMint,
        investor.publicKey
      );
      console.log(
        "New token account created:",
        investorNewTokenAccount.toBase58()
      );

      // Get disbursement PDA
      const [disbursementPda, disbursementBump] =
        await PublicKey.findProgramAddressSync(
          [
            Buffer.from("disbursement"),
            property.toBuffer(),
            newTokenMint.toBuffer(),
          ],
          program.programId
        );
      console.log(
        "Using disbursement PDA:",
        disbursementPda.toBase58(),
        "with bump:",
        disbursementBump
      );

      // Verify current token balances
      const oldBalance = await provider.connection.getTokenAccountBalance(
        investorTokenAccount
      );
      console.log(
        "Old token balance before conversion:",
        oldBalance.value.amount
      );

      // Verify disbursement state
      const disbursementData = await program.account.disbursement.fetch(
        disbursement
      );
      console.log("Disbursement state:", {
        property: disbursementData.property.toBase58(),
        oldMint: disbursementData.tokenMint.toBase58(),
        newMint: disbursementData.newTokenMint.toBase58(),
        totalAmount: disbursementData.totalAmount.toString(),
      });

      const tx = await program.methods
        .convertTokens(new anchor.BN(10))
        .accounts({
          disbursement,
          property,
          oldTokenMint: propertyTokenMint,
          newTokenMint,
          userOldTokenAccount: investorTokenAccount,
          userNewTokenAccount: investorNewTokenAccount,
          user: investor.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investor])
        .rpc();

      console.log("Conversion transaction:", tx);
      await provider.connection.confirmTransaction(tx);

      // Verify final balances
      const finalOldBalance = await provider.connection.getTokenAccountBalance(
        investorTokenAccount
      );
      const finalNewBalance = await provider.connection.getTokenAccountBalance(
        investorNewTokenAccount
      );
      console.log("Final balances:", {
        oldTokens: finalOldBalance.value.amount,
        newTokens: finalNewBalance.value.amount,
      });

      assert.equal(
        finalOldBalance.value.amount,
        "0",
        "Old tokens should be burned"
      );
      assert.equal(
        finalNewBalance.value.amount,
        "10",
        "New tokens should be minted"
      );
    } catch (err) {
      console.log("Conversion error details:", err);
      if (err instanceof anchor.AnchorError) {
        console.log("Error program:", err.program);
        console.log("Error code:", err.error.code);
        console.log("Error msg:", err.error.msg);
      }
      throw err;
    }
  });

  it("Fails to update property with wrong manager", async () => {
    let errorOccurred = false;
    try {
      await program.methods
        .updateValuation(new anchor.BN(1300))
        .accounts({
          property,
          manager: investor.publicKey,
        })
        .signers([investor])
        .rpc();
    } catch (err) {
      console.log("Expected error:", err.toString());
      errorOccurred = true;
    }
    assert(errorOccurred, "Transaction should have failed");
  });

  it("Fails to invest after funding period", async () => {
    let errorOccurred = false;
    try {
      await program.methods
        .investInProperty(new anchor.BN(10))
        .accounts({
          property,
          tokenMint: propertyTokenMint,
          investorTokenAccount,
          investor: investor.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investor])
        .rpc();
    } catch (err) {
      console.log("Expected error:", err.toString());
      errorOccurred = true;
    }
    assert(errorOccurred, "Transaction should have failed");
  });

  after(async () => {
    console.log("Cleaning up and returning remaining SOL...");

    // Helper function to get account SOL balance
    const getBalance = async (pubkey: PublicKey): Promise<number> => {
      return await provider.connection.getBalance(pubkey);
    };

    // Helper function to send remaining SOL
    const sendRemainingSol = async (sender: Keypair): Promise<void> => {
      try {
        const balance = await getBalance(sender.publicKey);
        if (balance > 0.01 * LAMPORTS_PER_SOL) {
          // Leave 0.01 SOL for fees
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: sender.publicKey,
              toPubkey: RECIPIENT_WALLET,
              lamports: balance - 0.01 * LAMPORTS_PER_SOL,
            })
          );

          const signature = await provider.connection.sendTransaction(
            transaction,
            [sender]
          );
          await provider.connection.confirmTransaction(signature);
          console.log(
            `Returned ${
              (balance - 0.01 * LAMPORTS_PER_SOL) / LAMPORTS_PER_SOL
            } SOL from ${sender.publicKey.toString()}`
          );
        }
      } catch (error) {
        console.error(
          `Error returning SOL from ${sender.publicKey.toString()}:`,
          error
        );
      }
    };

    // Return SOL from all test accounts
    await Promise.all([
      sendRemainingSol(admin),
      sendRemainingSol(propertyManager),
      sendRemainingSol(investor),
    ]);

    // Log final balances
    console.log("Final balances:");
    console.log(
      `Admin: ${(await getBalance(admin.publicKey)) / LAMPORTS_PER_SOL} SOL`
    );
    console.log(
      `Property Manager: ${
        (await getBalance(propertyManager.publicKey)) / LAMPORTS_PER_SOL
      } SOL`
    );
    console.log(
      `Investor: ${
        (await getBalance(investor.publicKey)) / LAMPORTS_PER_SOL
      } SOL`
    );
  });
});

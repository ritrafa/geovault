import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface PropertyDetails {
  property_pubkey: string;
  address: string;
  description: string;
  images: string[];
  documents: string[];
}

export interface InvestmentHistory {
  property_pubkey: string;
  investor_wallet: string;
  amount: number;
  transaction_signature: string;
  timestamp: Date;
}

export class SupabaseUtils {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // User Management
  async createUser(wallet: string, name: string, email: string) {
    return await this.supabase
      .from("users")
      .insert([{ wallet_address: wallet, name, email }]);
  }

  async updateUser(
    wallet: string,
    updates: Partial<{ name: string; email: string }>
  ) {
    return await this.supabase
      .from("users")
      .update(updates)
      .eq("wallet_address", wallet);
  }

  // Property Management
  async createPropertyDetails(details: PropertyDetails) {
    return await this.supabase.from("property_details").insert([details]);
  }

  async updatePropertyDetails(
    propertyPubkey: string,
    updates: Partial<PropertyDetails>
  ) {
    return await this.supabase
      .from("property_details")
      .update(updates)
      .eq("property_pubkey", propertyPubkey);
  }

  async getPropertyDetails(propertyPubkey: string) {
    return await this.supabase
      .from("property_details")
      .select("*")
      .eq("property_pubkey", propertyPubkey)
      .single();
  }

  // Investment Tracking
  async recordInvestment(history: InvestmentHistory) {
    return await this.supabase.from("investment_history").insert([history]);
  }

  async getInvestmentHistory(wallet: string) {
    return await this.supabase
      .from("investment_history")
      .select("*")
      .eq("investor_wallet", wallet);
  }

  // Valuation History
  async recordValuationChange(
    propertyPubkey: string,
    oldValue: number,
    newValue: number,
    changedBy: string
  ) {
    return await this.supabase.from("valuation_history").insert([
      {
        property_pubkey: propertyPubkey,
        old_value: oldValue,
        new_value: newValue,
        changed_by: changedBy,
      },
    ]);
  }

  // Disbursement Tracking
  async recordDisbursement(
    disbursementPubkey: string,
    propertyPubkey: string,
    amount: number,
    oldTokenMint: string,
    newTokenMint: string,
    createdBy: string
  ) {
    return await this.supabase.from("disbursement_history").insert([
      {
        disbursement_pubkey: disbursementPubkey,
        property_pubkey: propertyPubkey,
        total_amount: amount,
        old_token_mint: oldTokenMint,
        new_token_mint: newTokenMint,
        created_by: createdBy,
      },
    ]);
  }

  // Claim History
  async recordClaim(
    disbursementPubkey: string,
    investorWallet: string,
    amount: number,
    transactionSignature: string
  ) {
    return await this.supabase.from("claim_history").insert([
      {
        disbursement_pubkey: disbursementPubkey,
        investor_wallet: investorWallet,
        amount: amount,
        transaction_signature: transactionSignature,
      },
    ]);
  }

  // Notifications
  async createNotification(userWallet: string, type: string, message: string) {
    return await this.supabase.from("notifications").insert([
      {
        user_wallet: userWallet,
        type,
        message,
        read: false,
      },
    ]);
  }

  async getUserNotifications(wallet: string) {
    return await this.supabase
      .from("notifications")
      .select("*")
      .eq("user_wallet", wallet)
      .eq("read", false);
  }

  async markNotificationAsRead(notificationId: string) {
    return await this.supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
  }

  // Real-time subscriptions
  subscribeToPropertyUpdates(
    propertyPubkey: string,
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel("property_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "property_details",
          filter: `property_pubkey=eq.${propertyPubkey}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToUserNotifications(
    wallet: string,
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel("user_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_wallet=eq.${wallet}`,
        },
        callback
      )
      .subscribe();
  }
}

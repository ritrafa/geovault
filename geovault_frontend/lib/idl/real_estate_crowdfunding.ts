import { Idl } from "@coral-xyz/anchor";

export const IDL: Idl = {
  version: "0.1.0",
  name: "real_estate_crowdfunding",
  instructions: [
    {
      name: "createUser",
      accounts: [
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "role",
          type: {
            defined: "UserRole",
          },
        },
      ],
    },
    {
      name: "updateUserRole",
      accounts: [
        {
          name: "targetUserAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "adminAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "newRole",
          type: {
            defined: "UserRole",
          },
        },
      ],
    },
    {
      name: "createProperty",
      accounts: [
        {
          name: "property",
          isMut: true,
          isSigner: false,
        },
        {
          name: "managerAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "manager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "initialValuation",
          type: "u64",
        },
        {
          name: "tokenSupply",
          type: "u64",
        },
        {
          name: "lockPeriod",
          type: "u8",
        },
      ],
    },
    {
      name: "startFunding",
      accounts: [
        {
          name: "property",
          isMut: true,
          isSigner: false,
        },
        {
          name: "manager",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "completeFunding",
      accounts: [
        {
          name: "property",
          isMut: true,
          isSigner: false,
        },
        {
          name: "manager",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "updateValuation",
      accounts: [
        {
          name: "property",
          isMut: true,
          isSigner: false,
        },
        {
          name: "manager",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "newValuation",
          type: "u64",
        },
      ],
    },
    {
      name: "investInProperty",
      accounts: [
        {
          name: "property",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "investorTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "investor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "createDisbursement",
      accounts: [
        {
          name: "disbursement",
          isMut: true,
          isSigner: false,
        },
        {
          name: "property",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oldTokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "newTokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "manager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "totalAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "convertTokens",
      accounts: [
        {
          name: "disbursement",
          isMut: true,
          isSigner: false,
        },
        {
          name: "property",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oldTokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newTokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userOldTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userNewTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "UserAccount",
      docs: [],
      type: {
        kind: "struct",
        fields: [
          {
            name: "pubkey",
            docs: [],
            type: {
              defined: "publicKey",
            },
          },
          {
            name: "role",
            docs: [],
            type: {
              defined: "UserRole",
            },
          },
        ],
      },
    },
    {
      name: "Property",
      docs: [],
      type: {
        kind: "struct",
        fields: [
          {
            name: "manager",
            docs: [],
            type: {
              defined: "publicKey",
            },
          },
          {
            name: "initialValuation",
            docs: [],
            type: "u64",
          },
          {
            name: "currentValuation",
            docs: [],
            type: "u64",
          },
          {
            name: "tokenSupply",
            docs: [],
            type: "u64",
          },
          {
            name: "lockPeriod",
            docs: [],
            type: "u8",
          },
          {
            name: "isActive",
            docs: [],
            type: "bool",
          },
          {
            name: "isFrozen",
            docs: [],
            type: "bool",
          },
          {
            name: "unclaimedDisbursement",
            docs: [],
            type: "u64",
          },
          {
            name: "claimedDisbursement",
            docs: [],
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Disbursement",
      docs: [],
      type: {
        kind: "struct",
        fields: [
          {
            name: "property",
            docs: [],
            type: {
              defined: "publicKey",
            },
          },
          {
            name: "tokenMint",
            docs: [],
            type: {
              defined: "publicKey",
            },
          },
          {
            name: "newTokenMint",
            docs: [],
            type: {
              defined: "publicKey",
            },
          },
          {
            name: "totalAmount",
            docs: [],
            type: "u64",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "UserRole",
      type: {
        kind: "enum",
        variants: [
          {
            name: "User",
          },
          {
            name: "PropertyManager",
          },
          {
            name: "Admin",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "UnauthorizedRole",
      msg: "Unauthorized role for this action",
    },
    {
      code: 6001,
      name: "UnauthorizedManager",
      msg: "Unauthorized property manager",
    },
    {
      code: 6002,
      name: "PropertyNotFrozen",
      msg: "Property not in frozen state",
    },
  ],
  metadata: {
    address: "7n54hP2KnNHvC1KqQnBbJzy45B1bQsWmgApQdSy1ABaL",
  },
} as const;

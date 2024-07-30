import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import IDL from "./idl.json";

const programId = new PublicKey("6XookqjXLBqTWk2Zom4grnPu8ZMLRfVCwHoS7oumJJ3j");

function createProvider(wallet: AnchorWallet, connection: Connection) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);
  return provider;
}

export async function initializeUser(
  wallet: AnchorWallet,
  connection: Connection
) {
  const provider = createProvider(wallet, connection);
  const program = new Program(IDL as anchor.Idl, programId, provider);
  const [userPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), wallet.publicKey.toBuffer()],
    program.programId
  );

  // アカウントの存在確認を追加
  const accountInfo = await connection.getAccountInfo(userPDA);
  if (accountInfo !== null) {
    console.log("ユーザーアカウントは既に存在します！");
    return; // アカウントが存在する場合は初期化をスキップ
  }

  const tx = await program.methods
    .initializeUser()
    .accounts({
      user: userPDA,
      userWallet: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  console.log("ユーザー初期化トランザクション:", tx);
  return tx;
}


export async function addLearningTime(
  wallet: AnchorWallet,
  connection: Connection,
  minutes: number
) {
  const provider = createProvider(wallet, connection);
  const program = new Program(IDL as anchor.Idl, programId, provider);

  const [userPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), wallet.publicKey.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .addLearningTime(new anchor.BN(minutes))
    .accounts({
      user: userPDA,
      userWallet: wallet.publicKey,
    })
    .rpc();

  console.log("学習時間追加トランザクション:", tx);
  return tx;
}

export async function usePointsForContent(
  wallet: AnchorWallet,
  connection: Connection,
  points: number
) {
  const provider = createProvider(wallet, connection);
  const program = new Program(IDL as anchor.Idl, programId, provider);

  const [userPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), wallet.publicKey.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .usePointsForContent(new anchor.BN(points))
    .accounts({
      user: userPDA,
      userWallet: wallet.publicKey,
    })
    .rpc();

  console.log("ポイント使用トランザクション:", tx);
  return tx;
}

export async function fetchUserAccount(
  wallet: AnchorWallet,
  connection: Connection
) {
  const provider = createProvider(wallet, connection);
  const program = new Program(IDL as anchor.Idl, programId, provider);

  const [userPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), wallet.publicKey.toBuffer()],
    program.programId
  );

  const userAccount = await program.account.user.fetch(userPDA);
  return userAccount as { learningTime: anchor.BN; points: anchor.BN };
}

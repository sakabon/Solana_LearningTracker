"use client";

import { useState, useEffect } from "react";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  initializeUser,
  addLearningTime,
  usePointsForContent,
  fetchUserAccount,
} from "../anchorClient";

export default function Home() {
  const { connected } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<string>("");
  const [learningTime, setLearningTime] = useState<number | null>(0);
  const [points, setPoints] = useState<number | null>(0);
  const [minutes, setMinutes] = useState(0);

  const fetchUserData = async () => {
    if (!connected || !wallet) {
      setStatus("ウォレットが接続されていません");
      return;
    }

    setStatus("データ取得中...");

    try {
      const userAccount = await fetchUserAccount(wallet, connection);
      setLearningTime(userAccount.learningTime.toNumber());
      setPoints(userAccount.points.toNumber());
      setStatus("データ取得完了");
    } catch (error) {
      console.error("ユーザーデータの取得に失敗しました:", error);
      setStatus("データ取得エラー");
    }
  };

  const handleInitializeUser = async () => {
    if (!connected || !wallet) {
      setStatus("ウォレットが接続されていません");
      return;
    }

    setStatus("初期化中...");

    try {
      await initializeUser(wallet, connection);
      setStatus("初期化完了");
      alert("ユーザーアカウントが初期化されました！");
      await fetchUserData();
    } catch (error) {
      console.error("ユーザー初期化エラー:", error);
      setStatus("初期化エラー");
    }
  };

  const handleAddLearningTime = async () => {
    if (!connected) {
      setStatus("ウォレットが接続されていません");
      return;
    }

    if (!wallet) {
      setStatus("Anchorウォレットが接続されていません");
      return;
    }

    setStatus("プログラム実行中...");

    if (wallet && minutes > 0) {
      try {
        await addLearningTime(wallet, connection, minutes);
        alert(`${minutes}分の学習時間が追加されました！`);
        await fetchUserData();
        setMinutes(0);
      } catch (error) {
        console.error("学習時間追加エラー:", error);
      }
    }
  };

  const handleUsePoints = async () => {
    if (wallet && points >= 10) {
      try {
        await usePointsForContent(wallet, connection, 10);
        alert("10ポイントを使用してコンテンツをアンロックしました！");
        await fetchUserData();
      } catch (error) {
        console.error("ポイント使用エラー:", error);
      }
    } else {
      alert("ポイントが足りません。");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Learning Tracker</h1>
        {wallet ? (
          <div className="mt-8">
            <p>Total study time: {learningTime} min</p>
            <p>Points: {points}</p>
            <button
              onClick={handleInitializeUser}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Initialize
            </button>
            <div className="mt-4">
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value))}
                className="border p-2 mr-2"
                placeholder="Study time"
              />
              <button
                onClick={handleAddLearningTime}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add Learning Time
              </button>
            </div>
            <button
              onClick={handleUsePoints}
              className="bg-purple-500 text-white px-4 py-2 rounded mt-4"
            >
              Use Points "10 Points"
            </button>
          </div>
        ) : (
          <p className="mt-4">Connect Wallet</p>
        )}
      </div>
    </main>
  );
}

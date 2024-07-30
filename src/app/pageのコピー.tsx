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

  useEffect(() => {
    if (connected && wallet) {
      fetchUserData();
    }
  }, [connected, wallet]);

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
    } catch (error: unknown) {
      console.error("ユーザー初期化エラー:", error);
      if (error instanceof Error) {
        if (error.message.includes("already in use")) {
          setStatus("アカウントは既に存在します");
          alert("アカウントは既に初期化されています。");
        } else {
          setStatus("初期化エラー");
        }
      } else {
        setStatus("予期せぬエラーが発生しました");
      }
    }
  };
  
  

  const handleAddLearningTime = async () => {
    if (!connected || !wallet) {
      setStatus("ウォレットが接続されていません");
      return;
    }

    setStatus("学習時間を追加中...");

    try {
      await addLearningTime(wallet, connection, minutes);
      setStatus("学習時間を追加しました");
      alert(`${minutes}分の学習時間が追加されました！`);
      await fetchUserData();
      setMinutes(0); // 入力欄をリセット
    } catch (error) {
      console.error("学習時間追加エラー:", error);
      setStatus("学習時間の追加に失敗しました");
    }
  };

  const handleUsePoints = async () => {
    if (!connected || !wallet) {
      setStatus("ウォレットが接続されていません");
      return;
    }

    if (points === null || points < 10) {
      setStatus("ポイントが足りません");
      return;
    }

    setStatus("ポイントを使用中...");

    try {
      await usePointsForContent(wallet, connection, 10);
      setStatus("ポイントを使用しました");
      alert("10ポイントを使用してコンテンツをアンロックしました！");
      await fetchUserData();
    } catch (error) {
      console.error("ポイント使用エラー:", error);
      setStatus("ポイントの使用に失敗しました");
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
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="border p-2 mr-2"
                placeholder="学習時間（分）"
                min="0"
              />
              <button
                onClick={handleAddLearningTime}
                className="bg-green-500 text-white px-4 py-2 rounded"
                disabled={!connected || minutes <= 0}
              >
                Add Learning Time
              </button>
            </div>
            <button
              onClick={handleUsePoints}
              className="bg-purple-500 text-white px-4 py-2 rounded mt-4"
              disabled={!connected || points === null || points < 10}
            >
              Use Point "10 Points"
            </button>
          </div>
        ) : (
          <p className="mt-4">Connect Wallet</p>
        )}
      </div>
    </main>
  );
}

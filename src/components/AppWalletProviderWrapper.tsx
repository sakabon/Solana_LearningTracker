"use client";

import AppWalletProvider from './AppWalletProvider'
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function AppWalletProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppWalletProvider>
      <header className="p-4 bg-gray-800 text-white">
        <nav className="flex justify-end items-center space-x-4">
          <div className="ml-4">
            <WalletMultiButton style={{}} />
          </div>
        </nav>
      </header>
      {children}
    </AppWalletProvider>
  )
}

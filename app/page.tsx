"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Coffee, Wallet, CoffeeIcon, ArrowRight, Bean, Check, Loader2 } from "lucide-react"

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

export default function Home() {
  const [userAddress, setUserAddress] = useState<string>("")
  const [customerAddress, setCustomerAddress] = useState<string>("")
  const [coffeeBalance, setCoffeeBalance] = useState<number>(0)
  const [transactionStatus, setTransactionStatus] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [walletConnected, setWalletConnected] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string>("")

  const abi = [
    "function giveCoffeeTo(address user_address) external returns (bool)",
    "function getCoffeeBalanceFor(address user_address) external view returns (uint256)",
  ]

  const contractAddress = "0x52D087dbb5aD46691011B07A1c156a9f9c30868B"

  const displayToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const connectWallet = async () => {
    if (window?.ethereum) {
      setIsLoading(true)
      try {
        const result = await window?.ethereum.request({ method: "eth_requestAccounts" })
        setUserAddress(result[0])
        setWalletConnected(true)
        displayToast("Wallet connected successfully!")
      } catch (error) {
        displayToast("Failed to connect wallet")
      } finally {
        setIsLoading(false)
      }
    } else {
      displayToast("MetaMask not installed")
    }
  }

  const getCoffeeBalance = async () => {
    if (!customerAddress) {
      displayToast("Please enter an address")
      return
    }

    setIsLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      const result = await contract.getCoffeeBalanceFor(customerAddress)
      setCoffeeBalance(Number(result))
      displayToast("Balance updated!")
    } catch (error) {
      displayToast("Error fetching balance")
    } finally {
      setIsLoading(false)
    }
  }

  const giveCoffee = async () => {
    if (!customerAddress) {
      displayToast("Please enter a recipient address")
      return
    }

    setIsLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window?.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      setTransactionStatus("Processing transaction...")
      const tx = await contract.giveCoffeeTo(customerAddress)
      setTransactionStatus("Transaction sent! Waiting for confirmation...")
      await tx.wait()
      setTransactionStatus("Coffee successfully delivered!")
      displayToast("Coffee delivered successfully!")
    } catch (error) {
      setTransactionStatus("Transaction failed")
      displayToast("Unable to distribute coffee")
    } finally {
      setIsLoading(false)
    }
  }

  // Fix the address truncation function
  const truncateAddress = (address: string): string => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="min-h-screen bg-[#0c0807] text-[#e6d2c7] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#6f4e37]"
              style={{
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `float ${Math.random() * 10 + 15}s infinite ease-in-out`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-[#6f4e37] text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideIn">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <p>{toastMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-gradient-to-b from-[#2c1e18] to-[#1a120b] rounded-2xl shadow-[0_0_40px_rgba(111,78,55,0.3)] overflow-hidden border border-[#3d2c20] relative z-10">
        {/* Coffee Steam Animation */}
        <div className="absolute top-16 right-6 opacity-30">
          <div className="steam-container">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="steam"
                style={{
                  left: `${i * 10}px`,
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0.7 - i * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#3d2c20] to-[#5c3d28] p-6 flex items-center justify-center gap-3 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=100&width=100')] opacity-5 bg-repeat"></div>
          <Coffee className="h-8 w-8 text-[#d4a574]" />
          <h1 className="text-2xl font-bold text-[#e6d2c7]">Blockchain Brew</h1>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Wallet Section */}
          <div className="bg-[#1e150f] p-5 rounded-xl border border-[#3d2c20] shadow-inner">
            <button
              onClick={connectWallet}
              disabled={isLoading || walletConnected}
              className={`w-full ${walletConnected ? "bg-[#5c3d28]" : "bg-[#6f4e37] hover:bg-[#8b5a3c]"} text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md disabled:opacity-80`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
              {walletConnected ? "Wallet Connected" : "Connect Wallet"}
              {walletConnected && <Check className="h-4 w-4 ml-1" />}
            </button>

            {userAddress && (
              <div className="mt-4 p-4 bg-[#241a13] rounded-lg border border-[#3d2c20] shadow-inner">
                <p className="text-sm text-[#a18072]">Connected Address:</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-mono text-[#d4a574] truncate">{truncateAddress(userAddress)}</p>
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
              </div>
            )}
          </div>

          {/* Balance Section */}
          <div className="bg-[#1e150f] p-5 rounded-xl border border-[#3d2c20] shadow-inner">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter user address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="flex-1 bg-[#241a13] border border-[#3d2c20] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#d4a574] text-[#e6d2c7] placeholder-[#a18072]"
              />
              <button
                onClick={getCoffeeBalance}
                disabled={isLoading}
                className="bg-[#6f4e37] hover:bg-[#8b5a3c] text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md flex items-center whitespace-nowrap disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check"}
              </button>
            </div>

            <div className="mt-4 p-4 bg-[#241a13] rounded-lg border border-[#3d2c20] shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CoffeeIcon className="h-5 w-5 text-[#d4a574]" />
                  <p className="text-[#a18072]">Coffee Balance:</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-[#d4a574]">{coffeeBalance}</p>
                  <Bean className="h-4 w-4 text-[#d4a574]" />
                </div>
              </div>

              {/* Coffee Cup Visualization */}
              <div className="mt-3 h-6 bg-[#1a120b] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6f4e37] to-[#d4a574] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(coffeeBalance * 10, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Give Coffee Section */}
          <div className="bg-[#1e150f] p-5 rounded-xl border border-[#3d2c20] shadow-inner">
            <button
              onClick={giveCoffee}
              disabled={isLoading}
              className="w-full bg-[#d4a574] hover:bg-[#c69c6d] text-[#1a120b] font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-md disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Coffee className="h-6 w-6" />
                  <span>Brew Coffee</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {transactionStatus && (
              <div className="mt-4 p-4 bg-[#241a13] rounded-lg border border-[#3d2c20] shadow-inner">
                <p className="text-center font-medium text-[#d4a574]">{transactionStatus}</p>
                {transactionStatus.includes("Processing") && (
                  <div className="flex justify-center mt-2">
                    <div className="coffee-loading">
                      <div className="coffee-cup"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#241a13] p-4 text-center text-[#a18072] text-sm border-t border-[#3d2c20]">
          <p className="flex items-center justify-center gap-2">
            <Bean className="h-3 w-3" />
            <span>Blockchain Brew - Decentralized Coffee Distribution</span>
            <Bean className="h-3 w-3" />
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .steam {
          position: absolute;
          height: 50px;
          width: 10px;
          border-radius: 50%;
          background-color: #e6d2c7;
          opacity: 0;
          filter: blur(8px);
          animation: steam 3s ease-out infinite;
        }
        
        @keyframes steam {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 0.5; }
          50% { transform: translateY(-40px) scale(1.5); opacity: 0.2; }
          95% { opacity: 0; }
          100% { transform: translateY(-80px) scale(2); opacity: 0; }
        }
        
        .coffee-loading {
          position: relative;
          width: 40px;
          height: 40px;
          margin: 0 auto;
        }
        
        .coffee-cup {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid #d4a574;
          border-radius: 50%;
          animation: fill 2s ease-in-out infinite;
        }
        
        @keyframes fill {
          0% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(212, 165, 116, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0); }
        }
      `}</style>
    </div>
  )
}


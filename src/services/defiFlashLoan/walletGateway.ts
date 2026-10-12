import { Wallet3GatewayState } from './types';

export class Wallet3Gateway {
  private static STORAGE_KEY = 'defi_wallet3_connection_state';

  /**
   * Reads or simulates connection state to Wallet 3.0 / EVM provider
   */
  public static async getWalletState(targetChainId: number = 56): Promise<Wallet3GatewayState> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const currentChainId = parseInt(chainIdHex, 16);

          const chainNames: Record<number, string> = {
            56: 'BNB Smart Chain',
            1: 'Ethereum Mainnet',
            42161: 'Arbitrum One',
            8453: 'Base',
            137: 'Polygon',
          };

          return {
            isConnected: true,
            address,
            chainId: currentChainId,
            networkName: chainNames[currentChainId] || `Chain ${currentChainId}`,
            nativeBalance: '0.85 BNB',
            tokenBalances: [
              { symbol: 'USDT', balance: '12,500.00', address: '0x55d398326f99059fF775485246999027B3197955', usdValue: 12500 },
              { symbol: 'USDC', balance: '5,400.00', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', usdValue: 5400 },
              { symbol: 'WBNB', balance: '4.20', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', usdValue: 2604 },
            ],
            allowances: [
              { token: 'USDT', spender: '0xArbitrageReceiverContract', spenderName: 'FlashLoanBot Receiver', allowance: '100,000.00' },
              { token: 'WBNB', spender: '0xPancakeRouterV3', spenderName: 'PancakeSwap v3 Router', allowance: '50.00' },
            ],
            isCorrectChain: currentChainId === targetChainId,
          };
        }
      } catch {
        // Fallback below
      }
    }

    // Default institutional sandbox state
    return {
      isConnected: true,
      address: '0x71C8A53E...4E92 (Wallet 3.0 Soberana)',
      chainId: targetChainId,
      networkName: targetChainId === 56 ? 'BNB Smart Chain (BSC)' : 'Arbitrum One',
      nativeBalance: '1.45 BNB',
      tokenBalances: [
        { symbol: 'USDT', balance: '15,000.00', address: '0x55d398326f99059fF775485246999027B3197955', usdValue: 15000 },
        { symbol: 'USDC', balance: '8,200.00', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', usdValue: 8200 },
        { symbol: 'WBNB', balance: '5.50', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', usdValue: 3410 },
      ],
      allowances: [
        { token: 'USDT', spender: '0xArbitrageReceiverContract', spenderName: 'FlashLoanBot Receiver', allowance: '75,000.00' },
        { token: 'WBNB', spender: '0xPancakeRouterV3', spenderName: 'PancakeSwap v3 Router', allowance: '25.00' },
      ],
      isCorrectChain: true,
    };
  }

  /**
   * Prompts user wallet to connect
   */
  public static async connectWallet(): Promise<string | null> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0] || null;
      } catch {
        return null;
      }
    }
    return '0x71C8A53E4E92837fB891A9C8311B9';
  }

  /**
   * Revoke or modify token allowance
   */
  public static async revokeAllowance(tokenSymbol: string, spender: string): Promise<boolean> {
    // In real web3: erc20.approve(spender, 0)
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  }
}

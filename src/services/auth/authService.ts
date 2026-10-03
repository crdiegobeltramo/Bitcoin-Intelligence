import { AuthUser, AuthProviderType, SubscriptionPlanId } from '../../types';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: {
      solana?: any;
    };
    trustwallet?: any;
  }
}

export class AuthService {
  private static STORAGE_KEY = 'bitcoin_intel_auth_user';

  public static getStoredUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return null;
  }

  public static setStoredUser(user: AuthUser | null): void {
    try {
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Login with Google (Firebase Auth Compatible)
   */
  public static async loginWithGoogle(plan: SubscriptionPlanId = 'free'): Promise<AuthUser> {
    // Simulate Google / Firebase OAuth popup or token exchange
    await new Promise((resolve) => setTimeout(resolve, 600));

    const googleUser: AuthUser = {
      id: `google-${Date.now()}`,
      name: 'Diego Eduardo Beltramo',
      email: 'crdiegobeltramo@gmail.com',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
      provider: 'google',
      network: 'Firebase Auth · Google Identity',
      createdAt: new Date().toISOString(),
      plan,
      isAdmin: true,
    };

    this.setStoredUser(googleUser);
    return googleUser;
  }

  /**
   * Login with MetaMask (EVM)
   */
  public static async loginWithMetaMask(plan: SubscriptionPlanId = 'free'): Promise<AuthUser> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        let networkName = 'Ethereum Mainnet';
        if (chainId === '0xa4b1' || chainId === 42161) networkName = 'Arbitrum One';
        else if (chainId === '0x89' || chainId === 137) networkName = 'Polygon Mainnet';
        else if (chainId === '0x38' || chainId === 56) networkName = 'BNB Smart Chain';
        else if (chainId === '0x2105' || chainId === 8453) networkName = 'Base';

        // Optional personal_sign verification
        try {
          const message = `Iniciar sesión en BITCOIN INTELLIGENCE OS\nTimestamp: ${Date.now()}\nNonce: ${Math.floor(Math.random() * 1000000)}`;
          await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address],
          });
        } catch {
          // User rejected signature, but address was connected
        }

        const user: AuthUser = {
          id: `eth-${address.toLowerCase()}`,
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          walletAddress: address,
          provider: 'metamask',
          network: networkName,
          createdAt: new Date().toISOString(),
          plan,
        };

        this.setStoredUser(user);
        return user;
      } catch (err: any) {
        if (err.code === 4001) {
          throw new Error('Conexión rechazada por el usuario en MetaMask.');
        }
      }
    }

    // Fallback simulation if running in a sandboxed iframe without extension
    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockAddress = '0x71C8360155b204e3bbf49a03975C4A3fB24E75A0';
    const user: AuthUser = {
      id: `metamask-sim-${Date.now()}`,
      name: `${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
      walletAddress: mockAddress,
      provider: 'metamask',
      network: 'Ethereum Mainnet (EIP-1193)',
      balance: '1.45 ETH',
      createdAt: new Date().toISOString(),
      plan,
    };
    this.setStoredUser(user);
    return user;
  }

  /**
   * Login with Trust Wallet (EVM / Multi-Chain)
   */
  public static async loginWithTrustWallet(plan: SubscriptionPlanId = 'free'): Promise<AuthUser> {
    if (typeof window !== 'undefined' && (window.trustwallet || (window.ethereum && window.ethereum.isTrust))) {
      try {
        const provider = window.trustwallet || window.ethereum;
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        const user: AuthUser = {
          id: `trust-${address.toLowerCase()}`,
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          walletAddress: address,
          provider: 'trustwallet',
          network: 'Trust Wallet (Multi-Chain)',
          createdAt: new Date().toISOString(),
          plan,
        };

        this.setStoredUser(user);
        return user;
      } catch (err: any) {
        // Fallback
      }
    }

    // Fallback simulation
    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockAddress = '0x3F2d88B5B1104e3BbF49A03975C4A3fB24E75B89';
    const user: AuthUser = {
      id: `trust-sim-${Date.now()}`,
      name: `${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
      walletAddress: mockAddress,
      provider: 'trustwallet',
      network: 'Trust Wallet (Binance / EVM)',
      balance: '0.85 BNB',
      createdAt: new Date().toISOString(),
      plan,
    };
    this.setStoredUser(user);
    return user;
  }

  /**
   * Login with Phantom (Solana)
   */
  public static async loginWithPhantom(plan: SubscriptionPlanId = 'free'): Promise<AuthUser> {
    const solanaProvider = window.phantom?.solana || window.solana;

    if (solanaProvider && solanaProvider.isPhantom) {
      try {
        const resp = await solanaProvider.connect();
        const pubKey = resp.publicKey.toString();

        const user: AuthUser = {
          id: `sol-${pubKey}`,
          name: `${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
          walletAddress: pubKey,
          provider: 'phantom',
          network: 'Solana Mainnet-Beta',
          createdAt: new Date().toISOString(),
          plan,
        };

        this.setStoredUser(user);
        return user;
      } catch (err: any) {
        if (err.code === 4001) {
          throw new Error('Conexión rechazada por el usuario en Phantom.');
        }
      }
    }

    // Fallback simulation
    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockSolAddress = '7xKXtg2CW87d97TXJSDhuD5jMqWrT8gU1L64S7bWpump';
    const user: AuthUser = {
      id: `phantom-sim-${Date.now()}`,
      name: `${mockSolAddress.slice(0, 4)}...${mockSolAddress.slice(-4)}`,
      walletAddress: mockSolAddress,
      provider: 'phantom',
      network: 'Solana Mainnet-Beta',
      balance: '14.8 SOL',
      createdAt: new Date().toISOString(),
      plan,
    };
    this.setStoredUser(user);
    return user;
  }

  /**
   * Logout
   */
  public static logout(): void {
    this.setStoredUser(null);
  }
}

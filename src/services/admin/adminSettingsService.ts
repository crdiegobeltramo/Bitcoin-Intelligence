import {
  AdminTreasuryConfig,
  AdminMercadoPagoDevConfig,
  AdminTierScopesConfig,
  AdminAuditLog,
  AuthUser,
  SubscriptionPlanId
} from '../../types';

export const ADMIN_AUTHORIZED_EMAIL = 'crdiegobeltramo@gmail.com';
export const ADMIN_MASTER_PASSKEYS = ['DiegoAdmin2026!', '30-71829401-9', 'crdiegobeltramo', 'bitcoinintel2026'];

export const DEFAULT_TREASURY_CONFIG: AdminTreasuryConfig = {
  bitcoin: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  lightningNodePubkey: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f@198.51.100.1:9735',
  lightningAddress: 'diego@bitcoinintelligence.org',
  bch: 'bitcoincash:qp3wjpa3tjlj042z2wv7hahsldgwhwy0rq9sywjnv5',
  solana: '7xKXtg2CW87d97TXJSDhuD5jMqWrT8gU1L64S7bWpump',
  ethereum: '0x71C8360155b204e3bbf49a03975C4A3fB24E75A0',
  mercadopagoAlias: 'BITCOIN.INTEL.MP',
  mercadopagoCvu: '0000003100012345678901',
  cuitEmisor: '30-71829401-9',
  razonSocial: 'Bitcoin Intelligence Technologies S.A.S.',
  titular: 'Diego Eduardo Beltramo',
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_MP_DEV_CONFIG: AdminMercadoPagoDevConfig = {
  publicKey: 'APP_USR-782914-129401-d8a94b-4819',
  accessToken: 'APP_USR-444917874011-100115-98fbc9',
  clientId: '444917874011',
  clientSecret: 'a9f8e7d6c5b4a321',
  webhookUrl: 'https://ais-dev-p5s2yvucxfy6rwgogibfjg-444917874011.us-east5.run.app/api/webhooks/mercadopago',
  integratorId: 'dev_crdiegobeltramo',
  sandboxMode: false,
  autoReturn: 'approved',
  binaryMode: true,
  notificationEmail: 'crdiegobeltramo@gmail.com',
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_TIER_SCOPES_CONFIG: AdminTierScopesConfig = {
  free: {
    name: 'Explorer Community',
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    permissions: {
      copilotQueriesPerDay: 5,
      aiSecurityAuditsPerDay: 2,
      exportReports: false,
      multiAgentOrchestrator: false,
      deepResearchLab: false,
      portfolioRiskEngine: false,
      openZeppelinStudio: true,
      dexAmmSimulator: true,
      defiLendingAnalysis: false,
      privateWorkspaceProjects: 1,
      mcpConnectors: false,
      fiscalInvoiceArca: false,
      directSupport247: false,
    },
  },
  pro: {
    name: 'Pro Terminal & Copilot',
    monthlyPriceUsd: 49,
    annualPriceUsd: 490,
    permissions: {
      copilotQueriesPerDay: 'Unlimited',
      aiSecurityAuditsPerDay: 'Unlimited',
      exportReports: true,
      multiAgentOrchestrator: true,
      deepResearchLab: false,
      portfolioRiskEngine: true,
      openZeppelinStudio: true,
      dexAmmSimulator: true,
      defiLendingAnalysis: true,
      privateWorkspaceProjects: 20,
      mcpConnectors: false,
      fiscalInvoiceArca: true,
      directSupport247: false,
    },
  },
  institutional: {
    name: 'Institutional & Enterprise OS',
    monthlyPriceUsd: 199,
    annualPriceUsd: 1990,
    permissions: {
      copilotQueriesPerDay: 'Unlimited',
      aiSecurityAuditsPerDay: 'Unlimited',
      exportReports: true,
      multiAgentOrchestrator: true,
      deepResearchLab: true,
      portfolioRiskEngine: true,
      openZeppelinStudio: true,
      dexAmmSimulator: true,
      defiLendingAnalysis: true,
      privateWorkspaceProjects: 100,
      mcpConnectors: true,
      fiscalInvoiceArca: true,
      directSupport247: true,
    },
  },
  lastUpdated: new Date().toISOString(),
};

export class AdminSettingsService {
  private static KEY_TREASURY = 'bitcoin_intel_admin_treasury';
  private static KEY_MP = 'bitcoin_intel_admin_mp_dev';
  private static KEY_SCOPES = 'bitcoin_intel_admin_tier_scopes';
  private static KEY_AUDIT = 'bitcoin_intel_admin_audit_logs';
  private static KEY_SESSION = 'bitcoin_intel_admin_session_unlocked';

  // -------------------------------------------------------------
  // AUTORIZACIÓN Y CONTROL DE ACCESO
  // -------------------------------------------------------------

  public static isAuthorized(user: AuthUser | null): boolean {
    // Si el usuario logueado tiene el email oficial de Diego
    if (user && user.email && user.email.toLowerCase() === ADMIN_AUTHORIZED_EMAIL.toLowerCase()) {
      return true;
    }
    // O si ya desbloqueó la sesión administrativa con la clave de paso
    try {
      if (sessionStorage.getItem(this.KEY_SESSION) === 'true') {
        return true;
      }
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
    return false;
  }

  public static unlockSession(secretKey: string): boolean {
    const cleanKey = secretKey.trim();
    if (ADMIN_MASTER_PASSKEYS.includes(cleanKey)) {
      try {
        sessionStorage.setItem(this.KEY_SESSION, 'true');
      } catch {
        // Fallback
      }
      this.addAuditLog('DESBLOQUEO_ADMIN', 'Acceso concedido mediante credencial de seguridad maestra.');
      return true;
    }
    return false;
  }

  public static lockSession(): void {
    try {
      sessionStorage.removeItem(this.KEY_SESSION);
    } catch {
      // Fallback
    }
  }

  // -------------------------------------------------------------
  // CONFIGURACIÓN DE TESORERÍA CRIPTO Y CVU
  // -------------------------------------------------------------

  public static getTreasuryConfig(): AdminTreasuryConfig {
    try {
      const stored = localStorage.getItem(this.KEY_TREASURY);
      if (stored) {
        return { ...DEFAULT_TREASURY_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_TREASURY_CONFIG;
  }

  public static saveTreasuryConfig(config: AdminTreasuryConfig): void {
    try {
      const updated = {
        ...config,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.KEY_TREASURY, JSON.stringify(updated));
      this.addAuditLog('ACTUALIZACIÓN_TESORERÍA', 'Se actualizaron las direcciones de tesorería cripto / CVU.');
    } catch {
      // Fallback
    }
  }

  // -------------------------------------------------------------
  // CONFIGURACIÓN DE DESARROLLADOR MERCADO PAGO
  // -------------------------------------------------------------

  public static getMercadoPagoConfig(): AdminMercadoPagoDevConfig {
    try {
      const stored = localStorage.getItem(this.KEY_MP);
      if (stored) {
        return { ...DEFAULT_MP_DEV_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_MP_DEV_CONFIG;
  }

  public static saveMercadoPagoConfig(config: AdminMercadoPagoDevConfig): void {
    try {
      const updated = {
        ...config,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.KEY_MP, JSON.stringify(updated));
      this.addAuditLog('ACTUALIZACIÓN_MERCADOPAGO', 'Se actualizaron las credenciales y webhooks de Mercado Pago Developers.');
    } catch {
      // Fallback
    }
  }

  // -------------------------------------------------------------
  // CONFIGURACIÓN DE ALCANCES Y PERMISOS POR NIVEL
  // -------------------------------------------------------------

  public static getTierScopesConfig(): AdminTierScopesConfig {
    try {
      const stored = localStorage.getItem(this.KEY_SCOPES);
      if (stored) {
        return { ...DEFAULT_TIER_SCOPES_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_TIER_SCOPES_CONFIG;
  }

  public static saveTierScopesConfig(config: AdminTierScopesConfig): void {
    try {
      const updated = {
        ...config,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.KEY_SCOPES, JSON.stringify(updated));
      this.addAuditLog(
        'ACTUALIZACIÓN_TARIFAS_Y_ALCANCES',
        `Precios actualizados: Explorer ($${updated.free.monthlyPriceUsd}/m - $${updated.free.annualPriceUsd}/a), Pro ($${updated.pro.monthlyPriceUsd}/m - $${updated.pro.annualPriceUsd}/a), Institutional ($${updated.institutional.monthlyPriceUsd}/m - $${updated.institutional.annualPriceUsd}/a).`
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription-tiers-updated'));
      }
    } catch {
      // Fallback
    }
  }

  // -------------------------------------------------------------
  // REGISTRO DE AUDITORÍA (AUDIT LOGS)
  // -------------------------------------------------------------

  public static getAuditLogs(): AdminAuditLog[] {
    try {
      const stored = localStorage.getItem(this.KEY_AUDIT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return [
      {
        id: 'log-genesis-01',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: 'INICIALIZACIÓN_SISTEMA',
        details: 'Configuración inicial de tesorería y pasarela de Mercado Pago activada.',
        adminUser: ADMIN_AUTHORIZED_EMAIL,
      },
    ];
  }

  public static addAuditLog(action: string, details: string): void {
    try {
      const logs = this.getAuditLogs();
      const newLog: AdminAuditLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        action,
        details,
        adminUser: ADMIN_AUTHORIZED_EMAIL,
      };
      const updated = [newLog, ...logs].slice(0, 50); // Keep last 50
      localStorage.setItem(this.KEY_AUDIT, JSON.stringify(updated));
    } catch {
      // Fallback
    }
  }

  // -------------------------------------------------------------
  // RESTABLECIMIENTO GENERAL
  // -------------------------------------------------------------

  public static resetToDefaults(): void {
    try {
      localStorage.setItem(this.KEY_TREASURY, JSON.stringify(DEFAULT_TREASURY_CONFIG));
      localStorage.setItem(this.KEY_MP, JSON.stringify(DEFAULT_MP_DEV_CONFIG));
      localStorage.setItem(this.KEY_SCOPES, JSON.stringify(DEFAULT_TIER_SCOPES_CONFIG));
      this.addAuditLog('REINICIO_VALORES_PREDETERMINADOS', 'Todos los parámetros fueron restaurados a su configuración de fábrica.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription-tiers-updated'));
      }
    } catch {
      // Fallback
    }
  }
}

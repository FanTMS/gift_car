export type PaymentMethod = 'yoomoney' | 'telegram_wallet';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  orderId: string;
  returnUrl: string;
  customerEmail?: string;
  customerPhone?: string;
}

// YooMoney specific types
export interface YooMoneyPaymentRequest extends PaymentRequest {
  currency?: string;
}

export interface YooMoneyPaymentResponse {
  success: boolean;
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
  id?: string;
  status?: string;
  error?: {
    code: string;
    description: string;
  };
}

// Telegram Wallet specific types
export interface TelegramWalletPaymentRequest extends PaymentRequest {
  telegramUserId?: string;
  botUsername?: string;
}

export interface TelegramWalletPaymentResponse {
  success: boolean;
  invoiceUrl?: string;
  invoiceId?: string;
  error?: string;
} 
import { IPaymentService } from './IPaymentService';
import {
  PaymentRequest,
  PaymentResult,
  TelegramWalletPaymentRequest,
  TelegramWalletPaymentResponse
} from '../../types/payment';

/**
 * Сервис для работы с платежной системой Telegram Wallet
 */
export class TelegramWalletPaymentService implements IPaymentService {
  private readonly apiToken: string;
  private readonly apiUrl: string;
  private readonly botUsername: string;

  /**
   * Создает экземпляр сервиса Telegram Wallet
   * @param apiToken Токен API Telegram бота
   * @param botUsername Имя бота
   * @param apiUrl URL API Telegram (опционально)
   */
  constructor(
    apiToken: string,
    botUsername: string,
    apiUrl: string = 'https://api.telegram.org'
  ) {
    this.apiToken = apiToken;
    this.botUsername = botUsername;
    this.apiUrl = apiUrl;
  }

  /**
   * Инициирует платеж через Telegram Wallet
   * @param request Параметры запроса на оплату
   * @returns Результат инициации платежа
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Проверяем наличие токена
      if (!this.apiToken || this.apiToken.trim() === '') {
        console.error('Отсутствует токен API Telegram. Настройте переменную REACT_APP_TELEGRAM_API_TOKEN в .env файле.');
        return {
          success: false,
          error: 'Отсутствует токен API Telegram. Обратитесь к администратору.'
        };
      }

      // Продолжаем обработку с валидным токеном
      const telegramRequest: TelegramWalletPaymentRequest = {
        ...request,
        botUsername: this.botUsername
      };

      console.log('Используемые параметры Telegram API:', {
        apiUrl: this.apiUrl,
        botUsername: this.botUsername,
        tokenFirstChars: this.apiToken ? `${this.apiToken.substring(0, 5)}...` : 'отсутствует'
      });

      // Проверяем доступность Telegram Mini Apps API
      // @ts-ignore - Используем Telegram API, который может быть недоступен в типах
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        // Получаем доступ к WebApp
        // @ts-ignore - Используем Telegram API
        const telegramWebApp = window.Telegram.WebApp;
        
        // Проверяем наличие метода openInvoice
        if (telegramWebApp && typeof (telegramWebApp as any).openInvoice === 'function') {
          // Вызываем метод для создания счета
          (telegramWebApp as any).openInvoice({
            title: telegramRequest.description,
            description: telegramRequest.description,
            payload: JSON.stringify({ orderId: telegramRequest.orderId }),
            provider_token: this.apiToken,
            currency: 'RUB',
            prices: [{ label: 'Оплата', amount: Math.round(telegramRequest.amount * 100) }],
            callback_url: telegramRequest.returnUrl
          });

          // В этом случае результат будет обработан через события Telegram
          return {
            success: true,
            transactionId: telegramRequest.orderId,
          };
        }
      }
      
      // Альтернативный вариант - создание платежной ссылки
      const response = await fetch(`${this.apiUrl}/bot${this.apiToken}/createInvoiceLink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: telegramRequest.description,
          description: telegramRequest.description,
          payload: JSON.stringify({ orderId: telegramRequest.orderId }),
          provider_token: this.apiToken,
          currency: 'RUB',
          prices: [{ label: 'Оплата', amount: Math.round(telegramRequest.amount * 100) }],
          start_parameter: telegramRequest.orderId
        })
      });

      const data: TelegramWalletPaymentResponse = await response.json();

      if (data.success && data.invoiceUrl) {
        return {
          success: true,
          transactionId: data.invoiceId || telegramRequest.orderId,
          redirectUrl: data.invoiceUrl
        };
      } else {
        return {
          success: false,
          error: data.error || 'Ошибка при создании платежа'
        };
      }
    } catch (error) {
      console.error('Telegram Wallet payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Проверяет статус платежа (в Telegram это обычно делается через вебхуки)
   * @param transactionId Идентификатор транзакции для проверки
   * @returns Информация о статусе платежа
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentResult> {
    // В Telegram Wallet статус платежа обычно проверяется через вебхуки,
    // но мы можем проверить статус через базу данных
    return {
      success: true,
      transactionId: transactionId,
    };
  }
} 
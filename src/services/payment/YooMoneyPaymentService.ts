import { IPaymentService } from './IPaymentService';
import { 
  PaymentRequest, 
  PaymentResult, 
  YooMoneyPaymentRequest, 
  YooMoneyPaymentResponse 
} from '../../types/payment';

/**
 * Сервис для работы с платежной системой YooMoney
 */
export class YooMoneyPaymentService implements IPaymentService {
  private readonly apiUrl: string;
  private readonly shopId: string;
  private readonly secretKey: string;

  /**
   * Создает экземпляр сервиса YooMoney
   * @param shopId Идентификатор магазина
   * @param secretKey Секретный ключ магазина
   * @param apiUrl URL API YooMoney (опционально)
   */
  constructor(
    shopId: string, 
    secretKey: string, 
    apiUrl: string = 'https://api.yookassa.ru/v3'
  ) {
    this.shopId = shopId;
    this.secretKey = secretKey;
    this.apiUrl = apiUrl;
  }

  /**
   * Инициирует платеж через YooMoney
   * @param request Параметры запроса на оплату
   * @returns Результат инициации платежа
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const yooMoneyRequest: YooMoneyPaymentRequest = {
        ...request,
        currency: 'RUB'
      };

      const response = await fetch(`${this.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': `${Date.now()}-${yooMoneyRequest.orderId}`,
          'Authorization': `Basic ${btoa(`${this.shopId}:${this.secretKey}`)}`
        },
        body: JSON.stringify({
          amount: {
            value: yooMoneyRequest.amount.toFixed(2),
            currency: yooMoneyRequest.currency
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: yooMoneyRequest.returnUrl
          },
          description: yooMoneyRequest.description,
          metadata: {
            orderId: yooMoneyRequest.orderId
          }
        })
      });

      const data: YooMoneyPaymentResponse = await response.json();

      if (data.success && data.confirmation && data.id) {
        return {
          success: true,
          transactionId: data.id,
          redirectUrl: data.confirmation.confirmation_url
        };
      } else {
        return {
          success: false,
          error: data.error?.description || 'Ошибка при создании платежа'
        };
      }
    } catch (error) {
      console.error('YooMoney payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Проверяет статус платежа
   * @param transactionId Идентификатор транзакции для проверки
   * @returns Информация о статусе платежа
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.shopId}:${this.secretKey}`)}`
        }
      });

      const data = await response.json();

      return {
        success: data.status === 'succeeded',
        transactionId: data.id,
        error: data.status !== 'succeeded' ? `Статус платежа: ${data.status}` : undefined
      };
    } catch (error) {
      console.error('YooMoney status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка при проверке статуса платежа'
      };
    }
  }

  /**
   * Обрабатывает платеж через YooMoney
   * @param amount Сумма платежа
   * @param description Описание платежа
   * @param transactionId ID транзакции в вашей системе
   * @param customerId ID пользователя (если есть)
   * @param metadata Дополнительные метаданные
   * @returns Результат обработки платежа
   */
  public static async processPayment(
    amount: number,
    description: string,
    transactionId: string,
    customerId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    try {
      // В реальном приложении здесь будет обращение к API YooMoney
      // Сейчас реализуем упрощённую версию для демонстрации
      
      // Генерируем уникальный ID заказа
      const orderId = transactionId;
      
      // Формируем базовый URL возврата
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}/payment/result?orderId=${orderId}`;
      
      // В реальном приложении здесь будет примерно такой код:
      /*
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB'
          },
          description,
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: returnUrl
          },
          metadata: {
            orderId,
            customerId,
            ...metadata
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при обработке платежа через YooMoney');
      }
      
      return {
        success: true,
        transactionId: data.id,
        redirectUrl: data.confirmation.confirmation_url
      };
      */
      
      // Вместо этого, для демонстрации возвращаем успешный результат
      // с URL для перенаправления на эмулятор платежной страницы
      
      // Создаем URL с параметрами для тестовой страницы оплаты
      const paymentUrl = new URL(`${baseUrl}/payment-emulator`);
      paymentUrl.searchParams.append('orderId', orderId);
      paymentUrl.searchParams.append('amount', amount.toString());
      paymentUrl.searchParams.append('description', description);
      paymentUrl.searchParams.append('returnUrl', returnUrl);
      
      return {
        success: true,
        transactionId: orderId,
        redirectUrl: paymentUrl.toString()
      };
    } catch (error) {
      console.error('YooMoney payment error:', error);
      return {
        success: false,
        error: (error as Error).message || 'Ошибка при обработке платежа через YooMoney'
      };
    }
  }
} 
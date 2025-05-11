import { IPaymentService } from './IPaymentService';
import { YooMoneyPaymentService } from './YooMoneyPaymentService';
import { TelegramWalletPaymentService } from './TelegramWalletPaymentService';
import { PaymentMethod } from '../../types/payment';

/**
 * Фабрика для создания экземпляров платежных сервисов
 */
export class PaymentServiceFactory {
  // Конфигурация YooMoney
  private static readonly YOOMONEY_SHOP_ID = process.env.REACT_APP_YOOMONEY_SHOP_ID || '';
  private static readonly YOOMONEY_SECRET_KEY = process.env.REACT_APP_YOOMONEY_SECRET_KEY || '';
  
  // Конфигурация Telegram Wallet
  private static readonly TELEGRAM_API_TOKEN = process.env.REACT_APP_TELEGRAM_API_TOKEN || '';
  private static readonly TELEGRAM_BOT_USERNAME = process.env.REACT_APP_TELEGRAM_BOT_USERNAME || '';
  
  /**
   * Создает экземпляр платежного сервиса выбранного типа
   * @param method Тип платежного метода
   * @returns Экземпляр платежного сервиса
   */
  public static createPaymentService(method: PaymentMethod): IPaymentService {
    switch (method) {
      case 'yoomoney':
        return new YooMoneyPaymentService(
          this.YOOMONEY_SHOP_ID,
          this.YOOMONEY_SECRET_KEY
        );
      
      case 'telegram_wallet':
        // Если токен не указан в переменных окружения, создаем тестовый сервис
        const isMissingToken = !this.TELEGRAM_API_TOKEN || this.TELEGRAM_API_TOKEN.trim() === '';
        
        if (isMissingToken) {
          console.warn('Telegram API Token не найден в переменных окружения. Интеграция будет работать в тестовом режиме.');
          
          // Реализуем "мок" для тестирования без реального API
          return {
            async initiatePayment(request: any): Promise<any> {
              // Симуляция оплаты без API
              console.log('Тестовый режим оплаты:', request);
              
              // Возвращаем успешный результат с данными для перенаправления
              return {
                success: true,
                transactionId: request.orderId,
                redirectUrl: `https://t.me/test_payment_bot?start=${request.orderId}`
              };
            },
            
            async checkPaymentStatus(transactionId: string): Promise<any> {
              return { success: true, transactionId };
            }
          } as IPaymentService;
        }
        
        // В обычном режиме - создаем настоящий сервис
        return new TelegramWalletPaymentService(
          this.TELEGRAM_API_TOKEN,
          this.TELEGRAM_BOT_USERNAME
        );
      
      default:
        throw new Error(`Неподдерживаемый платежный метод: ${method}`);
    }
  }
} 
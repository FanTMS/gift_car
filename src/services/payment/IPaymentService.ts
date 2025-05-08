import { PaymentRequest, PaymentResult } from '../../types/payment';

/**
 * Общий интерфейс для всех платежных сервисов
 */
export interface IPaymentService {
  /**
   * Инициирует платежную операцию
   * @param request Запрос на оплату
   * @returns Результат инициации платежа
   */
  initiatePayment(request: PaymentRequest): Promise<PaymentResult>;
  
  /**
   * Проверяет статус платежа
   * @param transactionId Идентификатор транзакции для проверки
   * @returns Информация о статусе платежа
   */
  checkPaymentStatus(transactionId: string): Promise<PaymentResult>;
} 
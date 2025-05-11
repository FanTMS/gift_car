import { PaymentServiceFactory } from './PaymentServiceFactory';
import { PaymentMethod, PaymentRequest, PaymentResult } from '../../types/payment';
import { v4 as uuidv4 } from 'uuid';
import { YooMoneyPaymentService } from './YooMoneyPaymentService';
import { db } from '../../firebase/config';
import { 
  collection, 
  addDoc, 
  Timestamp, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';

/**
 * Сервис для обработки платежей
 */
export class PaymentProcessorService {
  /**
   * Обрабатывает платеж через выбранный метод оплаты
   * @param method Метод оплаты (например, 'yoomoney')
   * @param amount Сумма платежа
   * @param description Описание платежа
   * @param customerId ID клиента (если есть)
   * @param metadata Дополнительные метаданные платежа
   * @returns Результат обработки платежа
   */
  static async processPayment(
    method: PaymentMethod,
    amount: number,
    description: string,
    customerId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    try {
      // Определяем тип операции
      const operation = metadata?.operation || 'purchase';
      let transactionRef;
      
      // Создаем текущую дату для использования в базе данных
      const currentTimestamp = Timestamp.now();
      
      // Обработка в зависимости от типа операции
      if (operation === 'wallet_topup') {
        // Для пополнения кошелька
        transactionRef = await addDoc(collection(db, 'transactions'), {
          userId: customerId || 'anonymous',
          amount,
          status: 'pending',
          paymentMethod: method,
          createdAt: currentTimestamp,
          description,
          type: 'deposit',
          operation: 'wallet_topup',
          metadata: metadata || {}
        });
      } else {
        // Для покупки билетов
        // Проверка наличия необходимых метаданных
        if (!metadata || !metadata.raffleId || !metadata.ticketCount) {
          throw new Error('Необходимо указать raffleId и ticketCount в метаданных');
        }
        
        const { raffleId, ticketCount } = metadata;
        
        // Получение информации о розыгрыше
        const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
        if (!raffleDoc.exists()) {
          throw new Error('Розыгрыш не найден');
        }
        
        const raffle = raffleDoc.data();
        
        // Проверка доступности билетов
        if (raffle.ticketsSold + ticketCount > raffle.totalTickets) {
          throw new Error('Недостаточно доступных билетов для этого розыгрыша');
        }
        
        // Создаем запись о транзакции
        transactionRef = await addDoc(collection(db, 'transactions'), {
          userId: customerId || 'anonymous',
          raffleId,
          amount,
          status: 'pending',
          paymentMethod: method,
          ticketQuantity: ticketCount,
          createdAt: currentTimestamp,
          description,
          type: 'purchase',
          operation: 'add',
          metadata: metadata || {}
        });
        
        // Генерируем номера билетов
        const ticketNumbers = await this.generateTicketNumbers(raffleId, ticketCount);
        
        // Создаем запись о билетах
        await addDoc(collection(db, 'tickets'), {
          raffleId,
          userId: customerId || 'anonymous',
          quantity: ticketCount,
          purchaseDate: currentTimestamp,
          ticketNumbers,
          status: 'active',
          transactionId: transactionRef.id
        });
        
        // Обновляем количество проданных билетов
        await updateDoc(doc(db, 'raffles', raffleId), {
          ticketsSold: raffle.ticketsSold + ticketCount
        });
      }
      
      // Обрабатываем платеж в зависимости от метода оплаты
      switch (method) {
        case 'yoomoney':
          return await YooMoneyPaymentService.processPayment(
            amount,
            description,
            transactionRef.id,
            customerId,
            metadata
          );
        
        // Другие методы оплаты можно добавить здесь
        
        default:
          throw new Error(`Неподдерживаемый метод оплаты: ${method}`);
      }
    } catch (error) {
      console.error('Ошибка обработки платежа:', error);
      return {
        success: false,
        error: (error as Error).message || 'Произошла ошибка при обработке платежа'
      };
    }
  }
  
  /**
   * Генерирует уникальные номера билетов для розыгрыша
   * @param raffleId ID розыгрыша
   * @param count Количество билетов для генерации
   * @returns Массив номеров билетов
   */
  private static async generateTicketNumbers(raffleId: string, count: number): Promise<number[]> {
    try {
      // Получаем информацию о розыгрыше
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (!raffleDoc.exists()) {
        throw new Error('Розыгрыш не найден');
      }
      
      const raffle = raffleDoc.data();
      
      // Получаем уже использованные номера билетов для данного розыгрыша
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('raffleId', '==', raffleId)
      );
      
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const usedNumbers = new Set<number>();
      
      ticketsSnapshot.forEach(ticketDoc => {
        const ticketData = ticketDoc.data();
        if (ticketData.ticketNumbers && Array.isArray(ticketData.ticketNumbers)) {
          ticketData.ticketNumbers.forEach((num: number) => usedNumbers.add(num));
        }
      });
      
      // Генерируем уникальные номера билетов от 1 до totalTickets
      const result: number[] = [];
      const maxTicketNumber = raffle.totalTickets;
      
      while (result.length < count) {
        const randomNumber = Math.floor(Math.random() * maxTicketNumber) + 1;
        if (!usedNumbers.has(randomNumber) && !result.includes(randomNumber)) {
          result.push(randomNumber);
          usedNumbers.add(randomNumber);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка генерации номеров билетов:', error);
      throw error;
    }
  }
  
  /**
   * Проверяет статус платежа
   * @param transactionId Идентификатор транзакции
   * @param method Метод оплаты
   * @returns Результат проверки статуса
   */
  public static async checkPaymentStatus(
    transactionId: string,
    method: PaymentMethod
  ): Promise<PaymentResult> {
    try {
      const paymentService = PaymentServiceFactory.createPaymentService(method);
      return await paymentService.checkPaymentStatus(transactionId);
    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка при проверке статуса платежа'
      };
    }
  }
  
  /**
   * Сохраняет информацию о платеже в базу данных
   * В этом примере метод заглушка, в реальном приложении здесь должно быть
   * сохранение в Firebase или другую базу данных
   */
  private static async savePaymentInfo(
    transactionId: string,
    method: PaymentMethod,
    amount: number,
    customerId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Здесь должна быть реализация сохранения в базу данных
    console.log('Saving payment info:', {
      transactionId,
      method,
      amount,
      customerId,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
} 
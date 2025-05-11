import { doc, updateDoc, addDoc, collection, Timestamp, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import TonConnectService from '../TonConnectService';

interface TonPaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export class TonPaymentService {
  // Получение экземпляра TonConnectService
  private static getTonConnectService(): TonConnectService {
    return TonConnectService.getInstance();
  }
  
  // Проверяет, подключен ли кошелек TON
  public static isWalletConnected(): boolean {
    try {
      return this.getTonConnectService().isConnected();
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return false;
    }
  }
  
  // Получает адрес подключенного кошелька
  public static getWalletAddress(): string | null {
    try {
      return this.getTonConnectService().getWalletAddress();
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }
  
  // Конвертация суммы в наноTON (1 TON = 10^9 наноTON)
  private static toNano(amount: number): string {
    return (amount * 1_000_000_000).toString();
  }
  
  // Конвертация из наноTON в рубли (по курсу)
  private static tonToRub(amountTon: number): number {
    // Примерный курс TON к рублю (в реальном приложении нужно использовать API)
    const tonToRubRate = 270; // 1 TON = 270 рублей, например
    return Math.floor(amountTon * tonToRubRate);
  }
  
  // Процесс пополнения баланса через TON
  public static async topUpBalance(
    userId: string, 
    amountTon: number
  ): Promise<TonPaymentResult> {
    try {
      const tonConnectService = this.getTonConnectService();
      
      // Проверяем, подключен ли кошелек
      if (!tonConnectService.isConnected()) {
        throw new Error('TON кошелек не подключен');
      }
      
      // Конвертируем TON в рубли для зачисления
      const amountRub = this.tonToRub(amountTon);
      
      // Формируем транзакцию
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут на выполнение
        messages: [
          {
            address: 'EQBVCnrgKDQPx-Dv3D1BIwVhxIZs3eWNcg9jPKwUhOFVLbdj', // Адрес получателя платежа (сервисный кошелек)
            amount: this.toNano(amountTon),
            payload: `Replenishment for user ${userId}`, // Можно закодировать дополнительные данные
          },
        ],
      };
      
      // Отправляем транзакцию
      const transactionResult = await tonConnectService.sendTransaction(transaction);
      console.log('TON transaction result:', transactionResult);
      
      // Добавляем запись о транзакции в Firestore
      const transactionData = {
        userId,
        type: 'deposit',
        amount: amountRub,
        amountTon,
        status: 'completed', // В реальном приложении статус должен быть pending до подтверждения транзакции
        date: Timestamp.now(),
        description: `Пополнение через TON (${amountTon} TON)`,
        paymentMethod: 'ton_wallet',
        transactionHash: transactionResult.boc || '',
      };
      
      // Сохраняем транзакцию в базу данных
      const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
      
      // Обновляем баланс пользователя
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        balance: increment(amountRub),
        updatedAt: Timestamp.now()
      });
      
      return {
        success: true,
        transactionHash: transactionResult.boc
      };
    } catch (error) {
      console.error('Error processing TON payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }
} 
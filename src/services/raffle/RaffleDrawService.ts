import { db } from '../../firebase/config';
import { collection, getDocs, query, where, writeBatch, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Winner, Raffle, Ticket } from '../../types';
import { addRaffleWinner } from '../../firebase/services';

/**
 * Сервис для проведения розыгрыша и определения победителей
 */
export class RaffleDrawService {
  /**
   * Проводит розыгрыш, выбирая случайных победителей
   * @param raffleId ID розыгрыша
   * @returns Информация о выбранных победителях
   */
  static async drawWinners(raffleId: string): Promise<Winner[]> {
    try {
      // 1. Получаем информацию о розыгрыше
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (!raffleDoc.exists()) {
        throw new Error('Розыгрыш не найден');
      }
      
      const raffle = { id: raffleDoc.id, ...raffleDoc.data() } as Raffle;
      
      // 2. Получаем все билеты для данного розыгрыша
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('raffleId', '==', raffleId),
        where('status', '==', 'active')
      );
      
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const tickets = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
      
      if (tickets.length === 0) {
        throw new Error('Нет активных билетов для розыгрыша');
      }
      
      // 3. Определяем количество победителей
      const numberOfWinners = raffle.isMultiPrize && raffle.prizePlaces 
        ? raffle.prizePlaces.length 
        : 1;
      
      // 4. Формируем массив всех номеров билетов
      const allTicketNumbers: { userId: string, ticketNumber: number }[] = [];
      
      tickets.forEach(ticket => {
        if (ticket.ticketNumbers && ticket.ticketNumbers.length > 0) {
          ticket.ticketNumbers.forEach(number => {
            allTicketNumbers.push({
              userId: ticket.userId,
              ticketNumber: number
            });
          });
        }
      });
      
      // 5. Выбираем случайные номера билетов в качестве победителей
      const winners: Winner[] = [];
      
      // Текущая дата для всех победителей
      const currentTimestamp = Timestamp.now();
      
      // Если это мульти-розыгрыш с призовыми местами
      if (raffle.isMultiPrize && raffle.prizePlaces && raffle.prizePlaces.length > 0) {
        const prizesByPlace = new Map(raffle.prizePlaces.map(place => [place.place, place]));
        
        // Выбираем победителей для каждого места
        for (let i = 0; i < numberOfWinners; i++) {
          if (allTicketNumbers.length === 0) break;
          
          // Выбираем случайный индекс
          const randomIndex = Math.floor(Math.random() * allTicketNumbers.length);
          const winningTicket = allTicketNumbers[randomIndex];
          
          // Удаляем выбранный билет, чтобы он не был выбран повторно
          allTicketNumbers.splice(randomIndex, 1);
          
          // Получаем данные о призе для текущего места
          const place = i + 1;
          const prizePlace = prizesByPlace.get(place);
          
          // Создаем запись о победителе
          const winnerData: Omit<Winner, 'id'> = {
            raffleId,
            userId: winningTicket.userId,
            ticketNumber: winningTicket.ticketNumber,
            winDate: currentTimestamp,
            place: place,
            prizeTitle: prizePlace?.prizeTitle || `Приз ${place} места`,
            prizeImage: prizePlace?.prizeImage
          };
          
          // Сохраняем победителя в базу данных
          const newWinner = await addRaffleWinner(winnerData);
          winners.push({ ...winnerData, id: newWinner.id });
        }
      } else {
        // Обычный розыгрыш с одним победителем
        if (allTicketNumbers.length === 0) {
          throw new Error('Нет билетов для розыгрыша');
        }
        
        // Выбираем случайный индекс
        const randomIndex = Math.floor(Math.random() * allTicketNumbers.length);
        const winningTicket = allTicketNumbers[randomIndex];
        
        // Создаем запись о победителе
        const winnerData: Omit<Winner, 'id'> = {
          raffleId,
          userId: winningTicket.userId,
          ticketNumber: winningTicket.ticketNumber,
          winDate: currentTimestamp
        };
        
        // Сохраняем победителя в базу данных
        const newWinner = await addRaffleWinner(winnerData);
        winners.push({ ...winnerData, id: newWinner.id });
      }
      
      // 6. Обновляем статус розыгрыша на "completed"
      await updateDoc(doc(db, 'raffles', raffleId), {
        status: 'completed'
      });
      
      // 7. Обновляем статус билетов на "used"
      const batch = writeBatch(db);
      
      tickets.forEach(ticket => {
        const ticketRef = doc(db, 'tickets', ticket.id);
        batch.update(ticketRef, { status: 'used' });
      });
      
      await batch.commit();
      
      return winners;
    } catch (error) {
      console.error('Ошибка при проведении розыгрыша:', error);
      throw error;
    }
  }
} 
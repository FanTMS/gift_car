import { TonConnectUI, THEME } from "@tonconnect/ui";

// Синглтон для работы с TonConnectUI
class TonConnectService {
  private static instance: TonConnectService;
  private tonConnectUI: TonConnectUI | null = null;
  
  private constructor() {
    // Приватный конструктор для предотвращения создания дополнительных экземпляров
  }
  
  // Получение единственного экземпляра сервиса
  public static getInstance(): TonConnectService {
    if (!TonConnectService.instance) {
      TonConnectService.instance = new TonConnectService();
    }
    return TonConnectService.instance;
  }
  
  // Инициализация TonConnectUI (создаст экземпляр только при первом вызове)
  public getTonConnect(): TonConnectUI {
    if (!this.tonConnectUI) {
      try {
        console.log('Initializing TonConnectUI instance...');
        this.tonConnectUI = new TonConnectUI({
          manifestUrl: `${window.location.origin}/tonconnect-manifest.json`,
          uiPreferences: {
            theme: THEME.DARK
          },
          actionsConfiguration: {
            twaReturnUrl: `${window.location.origin}/wallet/telegram` as `https://${string}`,
          }
        });
        console.log('TonConnectUI initialized successfully');
      } catch (error) {
        console.error('Error initializing TonConnectUI:', error);
        throw new Error('Не удалось инициализировать TonConnect');
      }
    }
    return this.tonConnectUI;
  }
  
  // Проверяет, подключен ли кошелек
  public isConnected(): boolean {
    try {
      return this.tonConnectUI?.connected || false;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
  }
  
  // Получает адрес подключенного кошелька
  public getWalletAddress(): string | null {
    try {
      if (!this.tonConnectUI?.connected) return null;
      return this.tonConnectUI?.wallet?.account.address || null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }
  
  // Отправляет TON транзакцию
  public async sendTransaction(transaction: any): Promise<any> {
    if (!this.tonConnectUI?.connected) {
      throw new Error('TON кошелек не подключен');
    }
    
    return await this.tonConnectUI.sendTransaction(transaction);
  }
  
  // Открывает модальное окно выбора кошелька
  public async openModal(): Promise<void> {
    if (!this.tonConnectUI) {
      throw new Error('TonConnectUI не инициализирован');
    }
    
    return await this.tonConnectUI.openModal();
  }
  
  // Отключает кошелек
  public async disconnect(): Promise<void> {
    if (this.tonConnectUI?.connected) {
      await this.tonConnectUI.disconnect();
    }
  }
  
  // Подписка на изменения статуса подключения
  public onStatusChange(callback: (wallet: any) => void): () => void {
    if (!this.tonConnectUI) {
      throw new Error('TonConnectUI не инициализирован');
    }
    
    return this.tonConnectUI.onStatusChange(callback);
  }
}

export default TonConnectService; 
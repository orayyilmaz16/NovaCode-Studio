// Gerçek Zamanlı İşbirlikli Çalışma ve Canlı Senkronizasyon Modülü
import { io, Socket } from 'socket.io-client';

export interface RemotePeer {
  id: string;
  name: string;
  cursor?: { line: number; column: number };
}

class RealtimeSyncService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  // Canlı oda bağlantısı kur
  public connect(serverUrl: string = 'wss://echo.websocket.events', roomId: string = 'novacode-dev') {
    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      this.socket = io(serverUrl, {
        transports: ['websocket'],
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.emitLocal('connection_status', { connected: true, id: this.socket?.id });
        this.socket?.emit('join_room', { roomId });
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.emitLocal('connection_status', { connected: false });
      });

      this.socket.on('code_update', (data: { fileId: string; content: string }) => {
        this.emitLocal('code_update', data);
      });

      this.socket.on('cursor_move', (peer: RemotePeer) => {
        this.emitLocal('cursor_move', peer);
      });
    } catch (e) {
      console.warn('Realtime socket başlatılamadı, yerel fallback modunda çalışılıyor.');
    }
  }

  // Kod değişikliğini diğer eşlere yayınla
  public broadcastCodeChange(fileId: string, content: string) {
    if (this.isConnected && this.socket) {
      this.socket.emit('code_change', { fileId, content });
    }
  }

  // İmleç pozisyonunu yayınla
  public broadcastCursor(line: number, column: number) {
    if (this.isConnected && this.socket) {
      this.socket.emit('cursor_change', { line, column });
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: (data: any) => void) {
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(event, list.filter((cb) => cb !== callback));
    }
  }

  private emitLocal(event: string, data: any) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => cb(data));
    }
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const realtimeService = new RealtimeSyncService();

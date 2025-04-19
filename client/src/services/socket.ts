import { io, Socket } from "socket.io-client";

// Define interfaces to match your JSON structure
export interface LyricChordItem {
  lyrics: string;
  chords?: string;
}

export interface SongSelection {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  content?: LyricChordItem[][];
  scrollSpeed?: number;
}

class SocketService {
  private socket: Socket | null = null;
  private readonly listeners: Map<
    string,
    Array<(data: SongSelection) => void>
  > = new Map();

  connect(token?: string) {
    if (this.socket?.connected) return;

    // const socketUrl = "http://localhost:3000";
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";
    this.socket = io(socketUrl, {
      auth: token ? { token } : undefined,
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("songSelected", (songData: SongSelection) => {
      console.log("Song selected via socket:", songData);
      this.triggerListeners("songSelected", songData);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  selectSong(song: SongSelection) {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }
    console.log("Emitting selectSong event:", song);
    this.socket.emit("selectSong", song);
  }

  on(event: string, callback: (data: SongSelection) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: (data: SongSelection) => void) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.listeners.set(event, callbacks);
    }
  }

  private triggerListeners(event: string, data: SongSelection) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
export default socketService;

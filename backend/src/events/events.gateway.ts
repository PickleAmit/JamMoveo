import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SongContent } from '../song/song.controller';

// Define interfaces properly
export interface SongSelection {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  content?: SongContent;
  scrollSpeed?: number;
  hasText?: boolean;
  hasVideo?: boolean;
  hasAudio?: boolean;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients: Map<
    string,
    { userId?: string; isAdmin?: boolean }
  > = new Map();
  private currentSong: SongSelection | null = null;

  handleConnection(client: Socket): void {
    // Safe access to client properties
    const clientId = client?.id;
    if (!clientId) {
      this.logger.error('Invalid client connection');
      return;
    }

    this.logger.log(`Client connected: ${clientId}`);
    this.connectedClients.set(clientId, {});

    // Send current song if available
    if (this.currentSong && client) {
      client.emit('songSelected', this.currentSong);
    }
  }

  handleDisconnect(client: Socket): void {
    // Safe access to client properties
    const clientId = client?.id;
    if (!clientId) {
      return;
    }

    this.logger.log(`Client disconnected: ${clientId}`);
    this.connectedClients.delete(clientId);
  }

  @SubscribeMessage('selectSong')
  async handleSelectSong(
    @ConnectedSocket() client: Socket,
    @MessageBody() songData: SongSelection,
  ): Promise<void> {
    // Validate input
    if (!songData || !songData.id || !songData.title) {
      this.logger.error('Invalid song data received');
      return;
    }

    this.logger.log(`Song selected: ${songData.title}`);

    // Check if this is a stop command (special case with id=0 and title=STOP)
    if (songData.id === '0' && songData.title === 'STOP') {
      this.logger.log('Stop command received');
      this.currentSong = null;
      this.server.emit('songSelected', songData);
      return;
    }

    // Only process songs 1 and 2 with file content
    if (songData.id === '1' || songData.id === '2') {
      try {
        // Determine file path
        const fileName =
          songData.id === '1' ? 'hey_jude.json' : 'veech_shelo.json';
        const filePath = path.join(process.cwd(), 'src', 'song', fileName);

        // Read the file safely
        const fileContent = await this.readFileAsync(filePath);

        if (fileContent) {
          try {
            // Parse JSON safely
            const songContent: SongContent = JSON.parse(
              fileContent,
            ) as unknown as SongContent;

            // Create full song with content
            const fullSong: SongSelection = {
              ...songData,
              content: songContent,
            };

            // Update current song
            this.currentSong = fullSong;

            // Broadcast to all clients
            this.server.emit('songSelected', fullSong);
          } catch (parseError) {
            this.logger.error(
              `Failed to parse song content: ${this.getErrorMessage(parseError)}`,
            );
            this.server.emit('songSelected', songData);
          }
        } else {
          // If file reading failed, still broadcast the song without content
          this.server.emit('songSelected', songData);
        }
      } catch (error) {
        this.logger.error(
          `Error processing song: ${this.getErrorMessage(error)}`,
        );

        // Still broadcast the basic song data
        this.server.emit('songSelected', songData);
      }
    } else {
      // For other songs, just broadcast as is
      this.server.emit('songSelected', songData);
    }
  }

  // Helper method to read files asynchronously
  private async readFileAsync(filePath: string): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          this.logger.error(`Error reading file: ${this.getErrorMessage(err)}`);
          resolve(null);
        } else {
          resolve(data);
        }
      });
    });
  }

  // Helper method to safely get error messages
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
  }

  // Method to get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

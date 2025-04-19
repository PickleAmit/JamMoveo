import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface SongWord {
  lyrics: string;
  chords?: string;
}

export type SongContent = SongWord[][];

@Controller('songs')
export class SongController {
  private readonly songs = [
    {
      id: '1',
      title: 'Hey Jude',
      artist: 'The Beatles',
      imageUrl: 'https://via.placeholder.com/50',
      hasText: true,
      hasVideo: false,
      hasAudio: true,
      scrollSpeed: 2000,
    },
    {
      id: '2',
      title: 'Veech Shelo',
      artist: 'Israeli Artist',
      imageUrl: 'https://via.placeholder.com/50',
      hasText: true,
      hasVideo: false,
      hasAudio: true,
      scrollSpeed: 2000,
    },
    // Additional mock songs for the list
    {
      id: '3',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      imageUrl: 'https://via.placeholder.com/50',
      hasText: false,
      hasVideo: true,
      hasAudio: true,
    },
    {
      id: '4',
      title: 'Imagine',
      artist: 'John Lennon',
      imageUrl: 'https://via.placeholder.com/50',
      hasText: false,
      hasVideo: false,
      hasAudio: true,
    },
    {
      id: '5',
      title: 'Hotel California',
      artist: 'Eagles',
      imageUrl: 'https://via.placeholder.com/50',
      hasText: false,
      hasVideo: true,
      hasAudio: true,
    },
  ];

  @Get()
  getAllSongs() {
    return this.songs;
  }

  @Get(':id')
  getSongById(@Param('id') id: string) {
    const song = this.songs.find((s) => s.id === id);

    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }

    return song;
  }

  @Get(':id/content')
  getSongContent(@Param('id') id: string): SongContent {
    if (id !== '1' && id !== '2') {
      throw new NotFoundException('Content not available for this song');
    }

    try {
      const fileName = id === '1' ? 'hey_jude.json' : 'veech_shelo.json';
      const filePath = join(process.cwd(), 'src', 'song', fileName);

      const fileContent = readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as SongContent;
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Unknown error';
      throw new NotFoundException(`Could not read song content: ${message}`);
    }
  }
}

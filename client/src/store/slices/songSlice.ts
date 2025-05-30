import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the interfaces here instead of importing them to avoid the error
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
  hasText?: boolean;
  hasVideo?: boolean;
  hasAudio?: boolean;
}

interface SongState {
  availableSongs: SongSelection[];
  selectedSong: SongSelection | null;
  isPlaying: boolean; // Add isPlaying to the state
}

// The initial state with your two available songs
const initialState: SongState = {
  availableSongs: [
    {
      id: "1",
      title: "Hey Jude",
      artist: "The Beatles",
      imageUrl: "https://via.placeholder.com/50",
      hasText: true,
      hasVideo: false,
      hasAudio: true,
      scrollSpeed: 2000,
    },
    {
      id: "2",
      title: "Veech Shelo",
      artist: "Israeli Artist",
      imageUrl: "https://via.placeholder.com/50",
      hasText: true,
      hasVideo: false,
      hasAudio: true,
      scrollSpeed: 2000,
    },
  ],
  selectedSong: null,
  isPlaying: false, // Initialize as not playing
};

export const songSlice = createSlice({
  name: "song",
  initialState,
  reducers: {
    selectSong: (state, action: PayloadAction<SongSelection>) => {
      state.selectedSong = action.payload;
      // Auto-start playing when a song is selected (optional)
      state.isPlaying = true;
    },
    clearSelectedSong: (state) => {
      state.selectedSong = null;
      state.isPlaying = false;
    },
    addSong: (state, action: PayloadAction<SongSelection>) => {
      state.availableSongs.push(action.payload);
    },
    // Add these new action creators for play control
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    togglePlaying: (state) => {
      state.isPlaying = !state.isPlaying;
    },
  },
});

export const {
  selectSong,
  clearSelectedSong,
  addSong,
  setPlaying,
  togglePlaying,
} = songSlice.actions;

export default songSlice.reducer;

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import {
  Search,
  TextFields,
  MusicNote,
  Videocam,
  Stop,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { clearSelectedSong, selectSong } from "../store/slices/songSlice";
import { socketService, SongSelection } from "../services/socket";
import DashboardHeader from "../components/dashboardHeader";
import hotelCalifornia from "../assets/hotel_california.jpg";
import hey_jude from "../assets/hey_jude_img.jpg";
import veech_shelo from "../assets/veech_shelo.jpg";
import bohemian_rhapsody from "../assets/bohemian_rhapsody.jpg";
import imagine from "../assets/imagine.jpg";

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  hasText: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  scrollSpeed?: number;
}
// Helper function to detect Hebrew text
const containsHebrew = (text: string): boolean => {
  // Hebrew Unicode range
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

// Mock song data - replace with your actual songs
const allSongs = [
  {
    id: "1",
    title: "Hey Jude",
    artist: "The Beatles",
    imageUrl: hey_jude,
    hasText: true,
    hasVideo: false,
    hasAudio: true,
    scrollSpeed: 2000,
  },
  {
    id: "2",
    title: "Veech Shelo",
    artist: "אריאל זילבר",
    imageUrl: veech_shelo,
    hasText: true,
    hasVideo: false,
    hasAudio: true,
    scrollSpeed: 2000,
  },
  // Placeholder songs
  {
    id: "3",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    imageUrl: bohemian_rhapsody,
    hasText: false,
    hasVideo: true,
    hasAudio: true,
  },
  {
    id: "4",
    title: "Imagine",
    artist: "John Lennon",
    imageUrl: imagine,
    hasText: false,
    hasVideo: false,
    hasAudio: true,
  },
  {
    id: "5",
    title: "Hotel California",
    artist: "Eagles",
    imageUrl: hotelCalifornia,
    hasText: false,
    hasVideo: true,
    hasAudio: true,
  },
];

// Extracted components to reduce cognitive complexity
const SongItemContent = ({ song }: { song: Song; isHebrew: boolean }) => (
  <Box
    sx={{
      display: "flex",
      width: "100%",
      alignItems: "center",
      direction: "ltr",
    }}
  >
    <ListItemAvatar>
      <Avatar
        alt={song.title}
        src={song.imageUrl}
        variant="rounded"
        sx={{ width: 56, height: 56 }}
      />
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            direction: "ltr",
          }}
        >
          {song.title}
        </Typography>
      }
      secondary={
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            direction: "ltr",
          }}
        >
          {song.artist}
        </Typography>
      }
      sx={{ ml: 1 }}
    />
  </Box>
);

const SongItemActions = ({ song }: { song: Song }) => (
  <Box sx={{ display: "flex", gap: 1 }}>
    <IconButton
      size="small"
      sx={{
        color: song.hasText ? "#937100" : "#ccc",
        bgcolor: song.hasText ? "rgba(147, 113, 0, 0.1)" : "transparent",
      }}
      disabled={!song.hasText}
    >
      <TextFields fontSize="small" />
    </IconButton>
    <IconButton
      size="small"
      sx={{
        color: song.hasVideo ? "#937100" : "#ccc",
        bgcolor: song.hasVideo ? "rgba(147, 113, 0, 0.1)" : "transparent",
      }}
      disabled={!song.hasVideo}
    >
      <Videocam fontSize="small" />
    </IconButton>
    <IconButton
      size="small"
      sx={{
        color: song.hasAudio ? "#937100" : "#ccc",
        bgcolor: song.hasAudio ? "rgba(147, 113, 0, 0.1)" : "transparent",
      }}
      disabled={!song.hasAudio}
    >
      <MusicNote fontSize="small" />
    </IconButton>
  </Box>
);

const CurrentlyPlayingBar = ({
  selectedSong,
  socketConnected,
  onStopSong,
}: {
  selectedSong: SongSelection;
  socketConnected: boolean;
  onStopSong: () => void;
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "2px solid #FFCD29",
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            direction: "ltr",
          }}
        >
          Currently Playing:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            direction: "ltr",
          }}
        >
          {selectedSong.title} by {selectedSong.artist}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="error"
        startIcon={<Stop />}
        onClick={onStopSong}
        disabled={!socketConnected}
      >
        Stop Song
      </Button>
    </Paper>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedSong } = useAppSelector((state) => state.song);
  const [searchQuery, setSearchQuery] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [filteredSongs, setFilteredSongs] = useState(allSongs);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Connect to socket
  useEffect(() => {
    const token = localStorage.getItem("jamoveo_token");
    socketService.connect(token ?? undefined);

    const checkConnection = setInterval(() => {
      setSocketConnected(socketService.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      socketService.disconnect();
    };
  }, []);

  // Filter songs based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSongs(allSongs);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(lowerCaseQuery) ||
          song.artist.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSongSelect = async (song: SongSelection) => {
    try {
      // For development purposes, only the first two songs are functional
      if (song.id === "1") {
        // Hey Jude content
        const songWithContent = {
          ...song,
          content: [
            [
              { lyrics: "Hey" },
              { lyrics: "Jude", chords: "F" },
              { lyrics: "don't" },
              { lyrics: "make" },
              { lyrics: "it" },
              { lyrics: "bad", chords: "C" },
            ],
            [
              { lyrics: "Take" },
              { lyrics: "a" },
              { lyrics: "sad", chords: "C7" },
              { lyrics: "song", chords: "C4/7" },
              { lyrics: "and" },
              { lyrics: "make" },
              { lyrics: "it" },
              { lyrics: "better", chords: "F" },
            ],
            [
              { lyrics: "Remember", chords: "Bb" },
              { lyrics: "to" },
              { lyrics: "let" },
              { lyrics: "her" },
              { lyrics: "into" },
              { lyrics: "your" },
              { lyrics: "heart", chords: "F" },
            ],
            [
              { lyrics: "Then" },
              { lyrics: "you" },
              { lyrics: "can" },
              { lyrics: "start", chords: "C" },
              { lyrics: "to" },
              { lyrics: "make", chords: "C7" },
              { lyrics: "it" },
              { lyrics: "better", chords: "F" },
            ],
          ],
        };
        dispatch(selectSong(songWithContent));
        socketService.selectSong(songWithContent);
      } else if (song.id === "2") {
        // Veech Shelo content
        const songWithContent = {
          ...song,
          content: [
            [
              { lyrics: "Sample" },
              { lyrics: "lyrics", chords: "Am" },
              { lyrics: "for" },
              { lyrics: "Veech", chords: "G" },
              { lyrics: "Shelo" },
            ],
            [
              { lyrics: "With" },
              { lyrics: "example", chords: "F" },
              { lyrics: "chords" },
              { lyrics: "structure", chords: "E" },
            ],
          ],
        };
        dispatch(selectSong(songWithContent));
        socketService.selectSong(songWithContent);
      } else {
        // For other songs, just send basic info since we don't have content
        dispatch(selectSong(song));
        socketService.selectSong(song);
      }

      setNotification({
        open: true,
        message: `Song "${song.title}" by ${song.artist} has been selected!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error selecting song:", error);
      setNotification({
        open: true,
        message: "Error selecting song. Please check your connection.",
        severity: "error",
      });
    }
  };

  // Handle stopping the current song
  const handleStopSong = () => {
    if (!socketConnected) {
      setNotification({
        open: true,
        message: "Cannot stop song while offline.",
        severity: "error",
      });
      return;
    }

    // Send a special "STOP" song command
    const stopCommand: SongSelection = {
      id: "0",
      title: "STOP",
      artist: "",
    };

    // Update local state
    dispatch(clearSelectedSong());

    // Send to all users
    socketService.selectSong(stopCommand);

    setNotification({
      open: true,
      message: "Song stopped for all users",
      severity: "success",
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Render a song item with proper RTL support
  const renderSongItem = (song: (typeof allSongs)[0], index: number) => {
    const isHebrew = containsHebrew(song.title) || containsHebrew(song.artist);
    const isSelected = selectedSong?.id === song.id;

    return (
      <React.Fragment key={song.id}>
        <ListItem
          alignItems="center"
          sx={{
            cursor: "pointer",
            bgcolor: isSelected ? "rgba(255, 205, 41, 0.1)" : "transparent",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
            py: 1.5,
          }}
          onClick={() => handleSongSelect(song)}
        >
          <SongItemContent song={song} isHebrew={isHebrew} />
          <SongItemActions song={song} />
        </ListItem>
        {index < filteredSongs.length - 1 && <Divider component="li" />}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Exo, sans-serif",
      }}
    >
      <DashboardHeader
        handleLogout={handleLogout}
        socketConnected={socketConnected}
      />

      <Box sx={{ padding: "1.5rem" }}>
        {/* Current Song & Stop Button */}
        {selectedSong && (
          <CurrentlyPlayingBar
            selectedSong={selectedSong}
            socketConnected={socketConnected}
            onStopSong={handleStopSong}
          />
        )}

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "1rem",
              backgroundColor: "#fff",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Song List */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "#333",
          }}
        >
          Recommended Song List
        </Typography>

        <Paper
          elevation={2}
          sx={{
            borderRadius: "1rem",
            overflow: "hidden",
          }}
        >
          <List sx={{ width: "100%", bgcolor: "background.paper" }}>
            {filteredSongs.map(renderSongItem)}
          </List>
        </Paper>
      </Box>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;

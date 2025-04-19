import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Alert, Button } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { selectSong, clearSelectedSong } from "../store/slices/songSlice";
import { socketService, SongSelection } from "../services/socket";
import LyricsDisplay from "../components/LyricsDisplay";
import musicNotes from "../assets/music-note.png";
import DashboardHeader from "../components/DashboardHeader";

// Helper function to detect Hebrew text
const containsHebrew = (text: string): boolean => {
  // Hebrew Unicode range
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedSong } = useAppSelector((state) => state.song);
  const [localSelectedSong, setLocalSelectedSong] =
    useState<SongSelection | null>(selectedSong);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);

  // Determine if the song lyrics are in Hebrew
  const songLanguage = localSelectedSong?.content?.some((line) =>
    line.some((item) => containsHebrew(item.lyrics))
  )
    ? "hebrew"
    : "english";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Connect to socket and listen for song selections
  useEffect(() => {
    const token = localStorage.getItem("jamoveo_token");
    socketService.connect(token ?? undefined);

    const checkConnection = setInterval(() => {
      setSocketConnected(socketService.isConnected());
    }, 1000);

    // Listen for song selection events
    const handleSongSelected = (song: SongSelection) => {
      console.log("Song selected:", song);
      if (!song || (song.id === "0" && song.title === "STOP")) {
        // Handle stop song command
        dispatch(clearSelectedSong());
        setLocalSelectedSong(null);
        setIsPlaying(false);
      } else {
        dispatch(selectSong(song));
        setLocalSelectedSong(song);
        // Auto-start playing when a new song is selected
        setIsPlaying(true);
      }
    };

    socketService.on("songSelected", handleSongSelected);

    return () => {
      socketService.off("songSelected", handleSongSelected);
      socketService.disconnect();
      clearInterval(checkConnection);
    };
  }, [dispatch]);

  // Update local song state when redux state changes
  useEffect(() => {
    setLocalSelectedSong(selectedSong);
  }, [selectedSong]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Get user role (singer or musician)
  const userRole =
    user?.instrument?.toLowerCase() === "singer" ? "singer" : "musician";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Exo, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DashboardHeader
        handleLogout={handleLogout}
        socketConnected={socketConnected}
      />

      {!socketConnected && (
        <Alert
          severity="warning"
          sx={{
            margin: isMobileView ? "0.5em 1em 0 1em" : "1em 2em 0 2em",
            borderRadius: "0.5em",
          }}
        >
          You are currently offline. You won't receive song updates until your
          connection is restored.
        </Alert>
      )}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: isMobileView ? "0.5em 1em 1em 1em" : "1em 2em 2em 2em",
          height: "calc(100vh - 80px)",
        }}
      >
        <Paper
          elevation={2}
          sx={{
            borderRadius: "1em",
            width: "100%",
            height: "100%",
            bgcolor: "#f9f9f9",
            border: localSelectedSong ? "2px solid black" : "2px dashed black",
            transition: "all 0.3s ease",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {localSelectedSong ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: isMobileView ? 1 : 2,
                  borderBottom: "1px solid #e0e0e0",
                  flexDirection: isMobileView ? "column" : "row",
                }}
              >
                <Box
                  sx={{
                    width: isMobileView ? "100%" : "auto",
                    mb: isMobileView ? 1 : 0,
                    textAlign: isMobileView ? "center" : "left",
                  }}
                >
                  <Typography
                    variant={isMobileView ? "h5" : "h4"}
                    sx={{
                      fontWeight: 700,
                      direction: songLanguage === "hebrew" ? "rtl" : "ltr",
                    }}
                  >
                    {localSelectedSong.title}
                  </Typography>
                  <Typography
                    variant={isMobileView ? "subtitle1" : "h6"}
                    sx={{
                      color: "#6E6D6D",
                      direction: songLanguage === "hebrew" ? "rtl" : "ltr",
                    }}
                  >
                    by {localSelectedSong.artist}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  onClick={togglePlay}
                  size={isMobileView ? "small" : "medium"}
                  sx={{
                    bgcolor: isPlaying ? "#e0e0e0" : "#FFCD29",
                    color: "#000",
                    "&:hover": {
                      bgcolor: isPlaying ? "#d0d0d0" : "#e0b526",
                    },
                  }}
                >
                  {isPlaying ? "Pause" : "Play"}
                </Button>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  overflow: "hidden",
                  p: isMobileView ? 1 : 2,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    textAlign: "left",
                    border: "1px solid #e0e0e0",
                    borderRadius: "0.5em",
                    p: isMobileView ? 1 : 3,
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <LyricsDisplay
                    content={localSelectedSong.content}
                    isPlaying={isPlaying}
                    scrollSpeed={localSelectedSong.scrollSpeed ?? 2000}
                    userRole={userRole}
                    language={songLanguage}
                  />
                </Box>
              </Box>
            </>
          ) : (
            // Waiting for song selection
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
                p: isMobileView ? 1 : 4,
                height: "100%",
                flex: 1,
              }}
            >
              <Box
                component="img"
                src={musicNotes}
                alt="music notes"
                sx={{
                  height: isMobileView ? "8vh" : "10vh",
                  objectFit: "contain",
                  mb: 2,
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: isMobileView ? "1.3rem" : "1.5rem",
                  textAlign: "center",
                }}
              >
                Waiting for next song...
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;

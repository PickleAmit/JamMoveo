import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useAppSelector } from "../store/hooks";

// Define interfaces to match your JSON structure
interface LyricChordItem {
  lyrics: string;
  chords?: string;
}

interface LyricsDisplayProps {
  content?: LyricChordItem[][];
  isPlaying?: boolean;
  scrollSpeed?: number;
  userRole?: string; // Add role to hide chords for singers
  language?: "hebrew" | "english"; // Add language support
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  content,
  isPlaying = false,
  scrollSpeed = 2000,
  userRole = "musician", // Default to musician which shows chords
  language = "english", // Default to English
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const showChords = userRole !== "singer"; // Hide chords for singers
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);

  // Determine text direction based on language
  const isRTL = language === "hebrew";

  // Auto-scrolling effect when isPlaying is true
  useEffect(() => {
    if (!isPlaying || !content || content.length === 0) return;

    // Reset to first line when song changes or starts
    setCurrentLineIndex(0);

    const scrollInterval = setInterval(() => {
      setCurrentLineIndex((prev) => {
        // Don't exceed the number of lines
        if (prev >= content.length - 1) {
          clearInterval(scrollInterval);
          return prev;
        }
        return prev + 1;
      });
    }, scrollSpeed);

    return () => clearInterval(scrollInterval);
  }, [content, isPlaying, scrollSpeed]);

  // Scroll to current line
  useEffect(() => {
    if (!containerRef.current || !content) return;

    const lineElements = containerRef.current.querySelectorAll(".lyric-line");
    if (lineElements[currentLineIndex]) {
      lineElements[currentLineIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex, content]);

  if (!content || content.length === 0) {
    return (
      <Typography
        variant="body1"
        sx={{ fontStyle: "italic", color: "#937100" }}
      >
        No lyrics available for this song.
      </Typography>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%", // Use full height
        overflowY: "auto",
        padding: isMobileView ? 1 : 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {content.map((line, lineIndex) => (
        <Box
          key={`line-${lineIndex}`}
          className="lyric-line"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            mb: 3,
            alignItems: "flex-end",
            padding: 1,
            backgroundColor:
              currentLineIndex === lineIndex
                ? "rgba(255, 205, 41, 0.1)"
                : "transparent",
            borderRadius: 1,
            transition: "background-color 0.3s ease",
            direction: isRTL ? "rtl" : "ltr", // Set text direction based on language
            textAlign: isRTL ? "right" : "left", // Align text based on direction
          }}
        >
          {line.map((item, itemIndex) => (
            <Box
              key={`item-${lineIndex}-${itemIndex}`}
              sx={{
                position: "relative",
                marginRight: isRTL ? 0 : 0.5,
                marginLeft: isRTL ? 0.5 : 0,
              }}
            >
              {showChords && item.chords && (
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: -16,
                    [isRTL ? "right" : "left"]: 0, // Position chords based on text direction
                    color: "blue",
                    fontWeight: "bold",
                    fontSize: isMobileView ? "0.7rem" : "0.8rem",
                  }}
                >
                  {item.chords}
                </Typography>
              )}
              <Typography
                variant="body1"
                component="span"
                sx={{
                  fontWeight: item.chords && showChords ? 500 : 400,
                  fontSize: isMobileView ? "0.9rem" : "1rem",
                }}
              >
                {item.lyrics}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default LyricsDisplay;

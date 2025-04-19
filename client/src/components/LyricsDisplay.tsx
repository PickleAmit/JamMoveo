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
  userRole?: string;
  language?: "hebrew" | "english";
  containerRef?: React.RefObject<HTMLDivElement | null>; // Fixed type
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  content,
  isPlaying = false,
  scrollSpeed = 2000,
  userRole = "musician",
  language = "english",
  containerRef, // External container ref
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const showChords = userRole !== "singer";
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);
  const isRTL = language === "hebrew";

  // Use the provided container ref or fallback to internal ref
  const scrollRef = containerRef || internalRef;

  // Auto-scrolling effect when isPlaying is true
  useEffect(() => {
    if (!isPlaying || !content || content.length === 0) {
      // Reset scroll position when song is stopped
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
      return;
    }

    // Reset to first line when song changes or starts
    setCurrentLineIndex(0);

    // Make sure we're at the top when starting
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

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
  }, [content, isPlaying, scrollSpeed, scrollRef]);

  // Scroll to current line
  useEffect(() => {
    if (!scrollRef.current || !content) return;

    const lineElements = scrollRef.current.querySelectorAll(".lyric-line");
    if (lineElements[currentLineIndex]) {
      const lineElement = lineElements[currentLineIndex] as HTMLElement;

      // Scroll the current line to center of view
      lineElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex, content, scrollRef]);

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
      ref={internalRef}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        // Don't set height or overflow here - parent container controls that
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
            direction: isRTL ? "rtl" : "ltr",
            textAlign: isRTL ? "right" : "left",
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
                    [isRTL ? "right" : "left"]: 0,
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

      {/* Add some padding at the bottom for smooth scrolling */}
      <Box sx={{ height: "50vh" }} />
    </Box>
  );
};

export default LyricsDisplay;

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
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  content,
  isPlaying = false,
  scrollSpeed = 2000,
  userRole = "musician",
  language = "english",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const showChords = userRole !== "singer";
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);
  const isRTL = language === "hebrew";

  // Auto-scrolling effect when isPlaying is true
  useEffect(() => {
    if (!isPlaying || !content || content.length === 0) {
      // Reset position when stopping
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      return;
    }

    // Reset to first line when song changes or starts
    setCurrentLineIndex(0);

    // Reset scroll position to top when starting
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
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
  }, [content, isPlaying, scrollSpeed]);

  // Scroll to current line - modified to be more controlled
  useEffect(() => {
    if (!containerRef.current || !content) return;

    const lineElements = containerRef.current.querySelectorAll(".lyric-line");
    if (lineElements[currentLineIndex]) {
      // Use scrollIntoView with specific offset for better control
      const lineElement = lineElements[currentLineIndex] as HTMLElement;
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const lineTop = lineElement.getBoundingClientRect().top;

      // Calculate offset to position line in the middle of the container
      const offset =
        lineTop - containerTop - containerRef.current.clientHeight / 3;

      // Smooth scroll with controlled behavior
      containerRef.current.scrollBy({
        top: offset,
        behavior: "smooth",
      });
    }
  }, [currentLineIndex, content]);

  // Add manual scroll handler to disable auto-scroll when user manually scrolls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleManualScroll = () => {
      if (isPlaying) {
        // If user manually scrolls while playing, we could add logic here
        // For example, we could stop auto-scrolling or note the user preference
      }
    };

    container.addEventListener("wheel", handleManualScroll);
    container.addEventListener("touchmove", handleManualScroll);

    return () => {
      container.removeEventListener("wheel", handleManualScroll);
      container.removeEventListener("touchmove", handleManualScroll);
    };
  }, [isPlaying]);

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
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        padding: isMobileView ? 1 : 2,
        display: "flex",
        flexDirection: "column",
        position: "relative", // Important for scroll containment
        flex: 1,
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

      {/* Add some padding at the bottom for better scrolling */}
      <Box sx={{ height: isMobileView ? "40vh" : "20vh" }} />
    </Box>
  );
};

export default LyricsDisplay;

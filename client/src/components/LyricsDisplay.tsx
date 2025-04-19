import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useAppSelector } from "../store/hooks";

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
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const showChords = userRole !== "singer";
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);
  const isRTL = language === "hebrew";

  // Reset state when song changes or stops
  useEffect(() => {
    if (!isPlaying) {
      setCurrentLineIndex(0);
      // Reset scroll position
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      setAutoScrollEnabled(true);
    }
  }, [isPlaying, content]);

  // Auto-scrolling effect when playing
  useEffect(() => {
    if (!isPlaying || !content || content.length === 0 || !autoScrollEnabled) {
      return;
    }

    const scrollInterval = setInterval(() => {
      setCurrentLineIndex((prev) => {
        if (prev >= content.length - 1) {
          clearInterval(scrollInterval);
          return prev;
        }
        return prev + 1;
      });
    }, scrollSpeed);

    return () => clearInterval(scrollInterval);
  }, [content, isPlaying, scrollSpeed, autoScrollEnabled]);

  // Handle manual scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (!isPlaying) return;

      setAutoScrollEnabled(false);

      // Re-enable auto-scroll after user stops scrolling for 5 seconds
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setAutoScrollEnabled(true);
      }, 5000);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Scroll to highlighted line
  useEffect(() => {
    if (!autoScrollEnabled || !containerRef.current || !content) return;

    const lineElements = containerRef.current.querySelectorAll(".lyric-line");
    if (lineElements[currentLineIndex]) {
      const lineElement = lineElements[currentLineIndex] as HTMLElement;

      // Get positions for calculation
      const containerRect = containerRef.current.getBoundingClientRect();
      const lineRect = lineElement.getBoundingClientRect();

      // Calculate where to scroll
      const relativePosition = lineRect.top - containerRect.top;
      const centerPosition =
        relativePosition - containerRect.height / 2 + lineRect.height / 2;

      // Perform smooth scroll
      containerRef.current.scrollBy({
        top: centerPosition,
        behavior: "smooth",
      });
    }
  }, [currentLineIndex, content, autoScrollEnabled]);

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
        WebkitOverflowScrolling: "touch", // Better iOS scrolling
        padding: isMobileView ? 1 : 2,
        position: "relative",
        // Disable propagation of scroll events to parent containers on touch devices
        touchAction: "pan-y", // Allow vertical touch scrolling only
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          // Important - prevents content from affecting parent
          position: "relative",
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

        {/* Add extra space at bottom for scrolling */}
        <Box sx={{ height: "40vh" }} />
      </Box>
    </Box>
  );
};

export default LyricsDisplay;

import React, { useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAppDispatch } from "../store/hooks";
import { setMobileView } from "../store/slices/uiSlice";

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({
  children,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // MUI's useMediaQuery hook to detect mobile devices
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    dispatch(setMobileView(isMobile));

    const handleResize = () => {
      const isMobileNow = window.innerWidth < theme.breakpoints.values.md;
      dispatch(setMobileView(isMobileNow));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch, isMobile, theme.breakpoints.values.md]);

  return <>{children}</>;
};

export default ResponsiveProvider;

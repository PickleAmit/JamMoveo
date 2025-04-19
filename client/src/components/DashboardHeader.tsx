import { AccountCircle, Logout } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import yellowLogo from "../assets/yellow_logo.png";
import { useAppSelector } from "../store/hooks";

interface DashboardHeaderProps {
  handleLogout: () => void;
  socketConnected: boolean;
}

function DashboardHeader(DashboardHeaderProps: Readonly<DashboardHeaderProps>) {
  const { handleLogout } = DashboardHeaderProps;
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#000",
        boxShadow: "none",
        borderRadius: "0 0 1em 1em",
        height: "8dvh",
        justifyContent: "center",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={yellowLogo}
            alt="JamMoveo Logo"
            sx={{
              height: "4dvh",
              objectFit: "contain",
              ml: { xs: 0, sm: 2 },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isMobileView ? 0 : 2,
          }}
        >
          <IconButton sx={{ color: "white" }} aria-label="profile">
            <AccountCircle sx={{ fontSize: 35 }} />
          </IconButton>
          <IconButton
            onClick={handleLogout}
            sx={{ color: "#FFCD29" }}
            aria-label="logout"
          >
            <Logout />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default DashboardHeader;

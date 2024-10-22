"use client";
import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ProdiIcon from "@mui/icons-material/CorporateFare";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InputIcon from "@mui/icons-material/Input";
import Collapse from "@mui/material/Collapse";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import Button from "@mui/material/Button";
import { useAccount } from "@/app/contexts/AccountContext";
import Image from "next/image";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(0),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Header = () => {
  const router = useRouter();
  const { toast } = useToast();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openNestedInput, setOpenNestedInput] = useState(false);
  const [openNestedData, setOpenNestedData] = useState(false);
  const { accountData } = useAccount();
  const drawerRef = useRef<HTMLDivElement>(null);

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    justifyContent: "space-between",
    ...theme.mixins.toolbar,
  }));

  const linkListSuperAdmin = [
    "pl",
    "cpl",
    "bk",
    "cpmk",
    "mk",
    "penilaian CPMK",
    "mahasiswa",
    "nilai",
    "akun",
    "prodi",
    "tahun Ajaran",
  ];

  const linkListKaprodi = [
    "pl",
    "cpl",
    "bk",
    "cpmk",
    "mk",
    "penilaian CPMK",
    "mahasiswa",
    "nilai",
  ];

  const linkListAdminProdi = [
    "pl",
    "cpl",
    "bk",
    "cpmk",
    "mk",
    "penilaian CPMK",
    "mahasiswa",
  ];

  const linkListDosen = ["mk", "nilai", "penilaian CPMK"];

  const linkList =
    accountData?.role === "Super Admin"
      ? linkListSuperAdmin
      : accountData?.role === "Kaprodi"
      ? linkListKaprodi
      : accountData?.role === "Admin Prodi"
      ? linkListAdminProdi
      : linkListDosen;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleClickInput = () => {
    setOpenNestedInput(!openNestedInput);
  };

  const handleClickData = () => {
    setOpenNestedData(!openNestedData);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [drawerRef]);

  const handleItemClick = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position='fixed' open={open}>
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            onClick={handleDrawerOpen}
            edge='start'
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant='h6'
            noWrap
            component='a'
            className='cursor-pointer'
            onClick={() => router.push(`/dashboard/`)}
          >
            OBE
          </Typography>
          {!accountData ? (
            <Typography
              variant='body1'
              sx={{ marginLeft: "auto", animation: "pulse 2s infinite" }}
            >
              ...
            </Typography>
          ) : (
            <Typography variant='body1' sx={{ marginLeft: "auto" }}>
              {accountData.nama} - {accountData.role}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        ref={drawerRef}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant='persistent'
        anchor='left'
        open={open}
      >
        <DrawerHeader className='flex justify-between'>
          <Image src='/Logo1.png' alt='logo' width={50} height={50} />
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          component='nav'
          aria-labelledby='nested-list-subheader'
        >
          <ListItemButton onClick={handleClickInput}>
            <ListItemIcon>
              <InputIcon />
            </ListItemIcon>
            <ListItemText primary='Input' />
            {openNestedInput ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openNestedInput} timeout='auto' unmountOnExit>
            {linkList.map((item) =>
              item === "mk" && accountData?.role === "Dosen" ? null : (
                <ListItemButton
                  key={item}
                  onClick={() =>
                    handleItemClick(
                      `/dashboard/data/${item.replace(/\s+/g, "")}`
                    )
                  }
                  sx={{ pl: 4 }}
                >
                  <ListItemText primary={item.toLocaleUpperCase()} />
                </ListItemButton>
              )
            )}
          </Collapse>
          <ListItemButton onClick={handleClickData}>
            <ListItemIcon>
              <TextSnippetIcon />
            </ListItemIcon>
            <ListItemText primary='Data' />
            {openNestedData ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openNestedData} timeout='auto' unmountOnExit>
            {linkList.map((item) => (
              <ListItemButton
                key={item}
                onClick={() =>
                  handleItemClick(`/dashboard/data/${item.replace(/\s+/g, "")}`)
                }
                sx={{ pl: 4 }}
              >
                <ListItemText primary={item.toLocaleUpperCase()} />
              </ListItemButton>
            ))}
          </Collapse>

          {accountData?.role !== "Dosen" && (
            <ListItemButton
              onClick={() => {
                router.push("/dashboard/prodi");
              }}
            >
              <ListItemIcon>
                <ProdiIcon />
              </ListItemIcon>
              <ListItemText primary='Data Prodi' />
            </ListItemButton>
          )}
        </List>
        <Button
          size='medium'
          variant='contained'
          color='error'
          className='text-black font-semibold bg-red-500 m-4'
          onClick={() => {
            toast({
              description: "Berhasil Log Out.",
            });
            Cookies.remove("token");
            router.push("/login");
            setOpen(false);
          }}
        >
          Logout
        </Button>
        <Divider />
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
      </Main>
    </Box>
  );
};

export default Header;

import { AuthProvider } from "@/common/components/AuthContext";
import "@/styles/globals.css";
import { ThemeProvider } from "@material-tailwind/react";
import type { AppProps } from "next/app";
import Router, { useRouter } from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Toaster } from "react-hot-toast";
import { NavbarWithMegaMenu } from "../common/components/navbar";

Router.events.on("routeChangeStart", (url) => {
  console.log(`Loading: ${url}`);
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { pathname } = router;
  const noNav =
    ["/"].includes(pathname) || ["/permissiondenied"].includes(pathname);

  return (
    <AuthProvider>
      <ThemeProvider>
        {noNav ? null : <NavbarWithMegaMenu />}

        <Toaster />
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  );
}

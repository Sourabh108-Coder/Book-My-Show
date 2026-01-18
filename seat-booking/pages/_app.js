import "@/styles/globals.css";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }) {
  return <><ToastContainer/><Component {...pageProps} /></>;
}

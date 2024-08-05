import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // veya kullanmak istediğiniz port
    host: "localhost", // veya başka bir host adı
  },
});

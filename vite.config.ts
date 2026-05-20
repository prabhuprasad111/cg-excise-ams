import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/cg-excise-ams/",
  plugins: [react(), tailwindcss()],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set base to your GitHub repo name, e.g. "/supervisor-workload-catalog/"
// Change this to match your repository name on GitHub.
export default defineConfig({
  plugins: [react()],
  base: "/supervisor-workload-catalog/",
});

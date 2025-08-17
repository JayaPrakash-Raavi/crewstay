/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string; // e.g. http://localhost:4000 or https://your-api.vercel.app
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPH_CMS_ENDPOINT: string
  readonly VITE_SPLIT_BILL_KEK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css?url' {
  const url: string
  export default url
}

declare const __APP_VERSION__: string

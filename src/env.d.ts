/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPH_CMS_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css?url' {
  const url: string
  export default url
}

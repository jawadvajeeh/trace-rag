// Server-side environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL: string
      readonly NODE_ENV: 'development' | 'production'
    }
  }
}

export {}

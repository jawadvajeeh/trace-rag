// Server-side environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL: string
      readonly REDIS_URL: string
      readonly JWT_SECRET: string
      readonly AUTH0_CLIENT_SECRET: string
      readonly STRIPE_SECRET_KEY: string
      readonly NODE_ENV: 'development' | 'production'
    }
  }
}

export {}

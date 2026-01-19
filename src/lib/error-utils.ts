class AppError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly cause?: unknown

  constructor(
    message: string,
    opts: { code: string; status: number; cause?: unknown },
  ) {
    super(message)
    this.name = 'AppError'
    this.code = opts.code
    this.status = opts.status
    this.cause = opts.cause
  }
}

function toAppError(
  err: unknown,
  fallback: { code: string; status: number; message: string },
) {
  if (err instanceof AppError) return err

  return new AppError(fallback.message, { ...fallback, cause: err })
}

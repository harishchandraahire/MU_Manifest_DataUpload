export type AppErrorKind = 'network' | 'auth' | 'upload' | 'api' | 'unknown'

export class AppError extends Error {
  kind: AppErrorKind

  constructor(kind: AppErrorKind, message: string) {
    super(message)
    this.name = 'AppError'
    this.kind = kind
  }
}

export interface TokenCreateRequest {
  Login: string
  Password: string
  MachineName: string
}

export interface TokenCreateResponse {
  statusCode: number
  exception: string | null
  userMessage: string
  result: string
}

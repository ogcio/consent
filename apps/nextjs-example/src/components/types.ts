export interface ConsoleLog {
  id: string
  message: string
  type: "info" | "error" | "warning"
  timestamp: string
}

export interface ApiCall {
  id: string
  timestamp: string
  method: string
  endpoint: string
  status: number
  data: unknown
  duration: number
}

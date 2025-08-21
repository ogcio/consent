"use client"

import {
  Button,
  Card,
  CardContainer,
  CardHeader,
  CardTitle,
} from "@govie-ds/react"
import type { ConsoleLog } from "./types"

interface ConsoleLogsCardProps {
  logs: ConsoleLog[]
  onClearLogs: () => void
  title?: string
  className?: string
}

export function ConsoleLogsCard({
  logs,
  onClearLogs,
  title = "Console Logs",
}: ConsoleLogsCardProps) {
  return (
    <Card type='horizontal'>
      <CardContainer>
        <CardHeader>
          <div className='flex flex-row gap-2 justify-between items-center'>
            <CardTitle>{title}</CardTitle>
            <div className='flex flex-col gap-1 justify-between items-center'>
              <Button type='button' onClick={onClearLogs} variant='secondary'>
                Clear Logs
              </Button>
              <span className='text-sm text-gray-500'>{logs.length} logs</span>
            </div>
          </div>
        </CardHeader>

        {logs.length === 0 ? (
          <div className='w-full text-center py-6 text-gray-500'>
            <p>No console logs yet.</p>
            <p className='text-sm'>
              Try different scenarios to see logs appear here.
            </p>
          </div>
        ) : (
          <div className='w-full space-y-2 max-h-64 overflow-y-auto bg-gray-900 rounded-lg p-3 font-mono text-sm'>
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-2 ${
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "warning"
                      ? "text-yellow-400"
                      : "text-green-400"
                }`}
              >
                <span className='text-gray-500 text-xs flex-shrink-0 mt-0.5'>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className='flex-1 break-words'>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </CardContainer>
    </Card>
  )
}

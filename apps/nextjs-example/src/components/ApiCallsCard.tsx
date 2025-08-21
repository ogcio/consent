"use client"

import {
  Button,
  Card,
  CardContainer,
  CardHeader,
  CardTitle,
} from "@govie-ds/react"
import type { ApiCall } from "./types"

interface ApiCallsCardProps {
  apiCalls: ApiCall[]
  onClearApiCalls: () => void
  title?: string
  className?: string
}

function getStatusColor(status: number) {
  if (status >= 200 && status < 300) return "text-green-600 bg-green-100"
  if (status >= 400 && status < 500) return "text-red-600 bg-red-100"
  if (status >= 500) return "text-red-600 bg-red-200"
  return "text-gray-600 bg-gray-100"
}

export function ApiCallsCard({
  apiCalls,
  onClearApiCalls,
  title = "API Calls",
}: ApiCallsCardProps) {
  return (
    <Card type='horizontal'>
      <CardContainer>
        <CardHeader>
          <div className='flex flex-row gap-2 justify-between items-center'>
            <CardTitle>{title}</CardTitle>
            <div className='flex flex-col gap-1 justify-between items-center'>
              <Button
                type='button'
                onClick={onClearApiCalls}
                variant='secondary'
              >
                Clear API Calls
              </Button>
              <span className='text-sm text-gray-500'>
                {apiCalls.length} calls made
              </span>
            </div>
          </div>
        </CardHeader>

        {apiCalls.length === 0 ? (
          <div className='w-full text-center py-6 text-gray-500'>
            <p>No API calls made yet.</p>
            <p className='text-sm'>
              Try scenarios that make API calls to see them appear here.
            </p>
          </div>
        ) : (
          <div className='w-full space-y-3 max-h-64 overflow-y-auto'>
            {apiCalls.map((call) => (
              <div
                key={call.id}
                className='border border-gray-200 rounded-lg p-3 bg-white'
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center space-x-2'>
                    <span className='font-mono text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded'>
                      {call.method}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(call.status)}`}
                    >
                      {call.status || "ERR"}
                    </span>
                  </div>
                  <div className='text-xs text-gray-500'>{call.duration}ms</div>
                </div>

                <div className='text-sm text-gray-700 mb-2 font-mono'>
                  {call.endpoint}
                </div>

                <div className='text-xs text-gray-500 mb-2'>
                  {new Date(call.timestamp).toLocaleString()}
                </div>

                <details className='text-xs'>
                  <summary className='cursor-pointer text-blue-600 hover:text-blue-800'>
                    View Response
                  </summary>
                  <pre className='mt-2 p-2 bg-gray-50 rounded overflow-x-auto'>
                    {JSON.stringify(call.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </CardContainer>
    </Card>
  )
}

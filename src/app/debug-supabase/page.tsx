"use client"

import { useState, useEffect } from "react"
import { supabase, checkSupabaseConnection, checkSupabaseSchema } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

type DebugStatus = {
  connectionChecked: boolean
  connected: boolean
  connectionError?: string
  schemaChecked: boolean
  schemaValid: boolean
  schemaError?: string
  availableTables: string[]
  sessionChecked: boolean
  hasSession: boolean
  sessionError?: string
  userInfo?: any
}

export default function DebugSupabasePage() {
  const [status, setStatus] = useState<DebugStatus>({
    connectionChecked: false,
    connected: false,
    schemaChecked: false,
    schemaValid: false,
    availableTables: [],
    sessionChecked: false,
    hasSession: false,
  })
  const { user, isLoading } = useUser()

  useEffect(() => {
    async function checkSupabase() {
      // Check connection
      try {
        const connectionResult = await checkSupabaseConnection()
        setStatus(prev => ({
          ...prev,
          connectionChecked: true,
          connected: connectionResult.connected,
          connectionError: connectionResult.error,
        }))

        // Only check schema if connection is successful
        if (connectionResult.connected) {
          try {
            const schemaResult = await checkSupabaseSchema()
            setStatus(prev => ({
              ...prev,
              schemaChecked: true,
              schemaValid: schemaResult.success,
              schemaError: schemaResult.error,
              availableTables: schemaResult.tables || [],
            }))
          } catch (error: any) {
            setStatus(prev => ({
              ...prev,
              schemaChecked: true,
              schemaValid: false,
              schemaError: error.message,
            }))
          }
        }
      } catch (error: any) {
        setStatus(prev => ({
          ...prev,
          connectionChecked: true,
          connected: false,
          connectionError: error.message,
        }))
      }

      // Check session
      try {
        const { data, error } = await supabase.auth.getSession()
        setStatus(prev => ({
          ...prev,
          sessionChecked: true,
          hasSession: !!data.session,
          sessionError: error?.message,
          userInfo: data.session?.user,
        }))
      } catch (error: any) {
        setStatus(prev => ({
          ...prev,
          sessionChecked: true,
          hasSession: false,
          sessionError: error.message,
        }))
      }
    }

    checkSupabase()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Debugger</h1>
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Connection Status</h2>
        <div className="space-y-2">
          <p>
            Connection: {status.connectionChecked ? (
              status.connected ? (
                <span className="text-green-600 font-bold">✅ Connected</span>
              ) : (
                <span className="text-red-600 font-bold">❌ Not Connected</span>
              )
            ) : (
              <span className="text-yellow-600">Checking...</span>
            )}
          </p>
          {status.connectionError && (
            <p className="text-red-600">Error: {status.connectionError}</p>
          )}
        </div>
      </div>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Database Schema</h2>
        <div className="space-y-2">
          <p>
            Schema: {status.schemaChecked ? (
              status.schemaValid ? (
                <span className="text-green-600 font-bold">✅ Valid</span>
              ) : (
                <span className="text-red-600 font-bold">❌ Invalid</span>
              )
            ) : (
              <span className="text-yellow-600">Checking...</span>
            )}
          </p>
          {status.schemaError && (
            <p className="text-red-600">Error: {status.schemaError}</p>
          )}
          <div>
            <p className="font-semibold">Available Tables:</p>
            <ul className="list-disc pl-5">
              {status.availableTables.map(table => (
                <li key={table}>{table}</li>
              ))}
              {status.schemaChecked && status.availableTables.length === 0 && (
                <li className="text-red-600">No tables found</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        <div className="space-y-2">
          <p>
            Session: {status.sessionChecked ? (
              status.hasSession ? (
                <span className="text-green-600 font-bold">✅ Active</span>
              ) : (
                <span className="text-orange-600 font-bold">⚠️ Not logged in</span>
              )
            ) : (
              <span className="text-yellow-600">Checking...</span>
            )}
          </p>
          {status.sessionError && (
            <p className="text-red-600">Error: {status.sessionError}</p>
          )}
          <p>
            User Context: {isLoading ? (
              <span className="text-yellow-600">Loading...</span>
            ) : user ? (
              <span className="text-green-600 font-bold">✅ User loaded</span>
            ) : (
              <span className="text-orange-600 font-bold">⚠️ No user in context</span>
            )}
          </p>
          {user && (
            <div className="mt-2">
              <p className="font-semibold">User Details:</p>
              <ul className="list-disc pl-5">
                <li>ID: {user.id}</li>
                <li>Name: {user.name}</li>
                <li>Email: {user.email}</li>
                <li>Location: {user.location || "Not set"}</li>
              </ul>
            </div>
          )}
          {status.userInfo && (
            <div className="mt-2">
              <p className="font-semibold">Session User Info:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(status.userInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
        <ul className="list-disc pl-5">
          <li>
            NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
              <span className="text-green-600">✅ Set</span>
            ) : (
              <span className="text-red-600">❌ Not set</span>
            )}
          </li>
          <li>
            NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
              <span className="text-green-600">✅ Set</span>
            ) : (
              <span className="text-red-600">❌ Not set</span>
            )}
          </li>
        </ul>
      </div>
    </div>
  )
} 
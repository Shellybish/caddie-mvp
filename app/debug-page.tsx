"use client"

import { useEffect, useState } from 'react'
import { checkSupabaseConnection, checkSupabaseSchema } from '@/lib/supabase'

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [schemaStatus, setSchemaStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkDatabase() {
      try {
        // Check connection
        const connection = await checkSupabaseConnection()
        setConnectionStatus(connection)
        
        // Check schema
        const schema = await checkSupabaseSchema()
        setSchemaStatus(schema)
      } catch (error) {
        console.error('Debug check error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkDatabase()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Debug Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        {loading ? (
          <p>Checking connection...</p>
        ) : (
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(connectionStatus, null, 2)}</pre>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Schema Status</h2>
        {loading ? (
          <p>Checking schema...</p>
        ) : (
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(schemaStatus, null, 2)}</pre>
        )}
      </div>
    </div>
  )
} 
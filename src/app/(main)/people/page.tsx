"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserSearch } from "@/components/user/user-search"

export default function PeoplePage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Find People to Follow</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search by Username</CardTitle>
          </CardHeader>
          <CardContent>
            <UserSearch />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
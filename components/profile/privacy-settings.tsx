"use client"

import React from "react"
import { Download, Trash2, AlertTriangle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PrivacySettingsProps {
  onExport: () => void
  onDelete: () => void
  loading: boolean
}

export function PrivacySettings({ onExport, onDelete, loading }: PrivacySettingsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Privacy & Data</h2>
        <p className="text-muted-foreground">
          Control your data and account existence.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download a copy of your personal data, resumes, and cover letters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
             <Download className="w-5 h-5 text-muted-foreground mt-0.5" />
             <div className="space-y-1">
               <p className="text-sm font-medium">Your data archive</p>
               <p className="text-xs text-muted-foreground">
                 Includes all your profile information, settings, and generated documents in a structured format.
               </p>
             </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onExport} disabled={loading}>
            {loading ? "Preparing..." : "Request Data Export"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions related to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50">
            <AlertTitle>Delete Account</AlertTitle>
            <AlertDescription>
              Permanently remove your account and all of its contents from the platform. This action is not reversible, so please continue with caution.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={onDelete} disabled={loading}>
            <Trash2 className="w-4 h-4 mr-2" />
            {loading ? "Deleting..." : "Delete Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import React from "react"
import { Lock, Shield, Key, Smartphone, LogOut, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { SecuritySettings as SecuritySettingsType } from "@/lib/profile-service"
import { formatDate } from "@/lib/format-utils"
import { UserPreferences } from "@/lib/profile-service"
import { Badge } from "@/components/ui/badge"

interface SecuritySettingsProps {
  security: SecuritySettingsType
  onPasswordChange: () => void
  on2FAToggle: (enabled: boolean) => void
  preferences?: UserPreferences
}

export function SecuritySettings({ security, onPasswordChange, on2FAToggle, preferences }: SecuritySettingsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Security & Login</h2>
        <p className="text-muted-foreground">
          Protect your account with advanced security features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Password
          </CardTitle>
          <CardDescription>Manage your password and login security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
            <div className="space-y-1">
              <p className="font-medium text-sm">Password Status</p>
              <div className="text-xs text-muted-foreground">
                {security.last_password_change ? (
                  <span>Last changed {formatDate(security.last_password_change, preferences)}</span>
                ) : (
                  <span>Not changed recently</span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onPasswordChange}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-muted-foreground">
                Use an app like Google Authenticator or Authy to generate verification codes.
              </p>
            </div>
            <Switch
              checked={security.two_factor_enabled}
              onCheckedChange={on2FAToggle}
            />
          </div>
          {security.two_factor_enabled && (
             <div className="p-4 bg-primary/10 rounded-lg text-sm text-primary border border-primary/20">
               Two-factor authentication is currently enabled. Your account is more secure.
             </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-primary" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage devices where you're currently logged in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-full">
                  <Laptop className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">This Browser</p>
                    <Badge variant="secondary" className="text-[10px] h-5">Current</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {navigator.platform} • {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                     navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Active now
              </div>
           </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" variant="outline" className="w-full text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out All Other Sessions
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

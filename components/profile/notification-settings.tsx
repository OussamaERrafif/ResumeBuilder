"use client"

import React from "react"
import { Bell, Mail, Shield, Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationSettings as NotificationSettingsType } from "@/lib/profile-service"

interface NotificationSettingsProps {
  notifications: NotificationSettingsType
  onUpdate: (key: keyof NotificationSettingsType, value: boolean) => void
}

export function NotificationSettings({ notifications, onUpdate }: NotificationSettingsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Choose what updates you want to receive. You can unsubscribe at any time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>Manage your email preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label className="text-base font-medium">Account Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive essential updates about your account, security, and billing.
              </p>
            </div>
            <Switch
              checked={notifications.email_notifications}
              onCheckedChange={(checked) => onUpdate("email_notifications", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label className="text-base font-medium">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive tips, trends, and promotional offers.
              </p>
            </div>
            <Switch
              checked={notifications.marketing_emails}
              onCheckedChange={(checked) => onUpdate("marketing_emails", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Product Updates
          </CardTitle>
          <CardDescription>Stay informed about new features and improvements.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label className="text-base font-medium">Feature Announcements</Label>
              <p className="text-sm text-muted-foreground">
                Be the first to know about new AI tools and resume templates.
              </p>
            </div>
            <Switch
              checked={notifications.feature_updates}
              onCheckedChange={(checked) => onUpdate("feature_updates", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security Alerts
          </CardTitle>
          <CardDescription>Receive alerts about suspicious activity.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label className="text-base font-medium">Security Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new logins and password changes. (Highly Recommended)
              </p>
            </div>
            <Switch
              checked={notifications.security_alerts}
              onCheckedChange={(checked) => onUpdate("security_alerts", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

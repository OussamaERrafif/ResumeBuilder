"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SecurityDashboard } from '@/components/security-dashboard'
import { Shield, Users, Settings, Activity } from 'lucide-react'

/**
 * Admin dashboard page with security monitoring
 * Example integration of the SecurityDashboard component
 */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System administration and security monitoring
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          System Secure
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98%</div>
                <p className="text-xs text-muted-foreground">Excellent security posture</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                View Logs
              </Button>
              <Button size="sm" variant="outline">
                Export Data
              </Button>
              <Button size="sm" variant="outline">
                System Health
              </Button>
              <Button size="sm" variant="outline">
                User Reports
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* This is where the SecurityDashboard component is integrated */}
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                User management features would go here. This could include:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
                <li>User list with roles and permissions</li>
                <li>Account status and last login</li>
                <li>Failed login attempts tracking</li>
                <li>Account lockout management</li>
                <li>Security settings per user</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Rate Limiting</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Web requests: 100 per 15 minutes</li>
                    <li>• API requests: 50 per 15 minutes</li>
                    <li>• Login attempts: 5 per 15 minutes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">File Upload Security</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Max file size: 10MB</li>
                    <li>• Allowed types: PDF, DOC, DOCX, TXT</li>
                    <li>• Virus scanning: Enabled</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Session Security</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Session timeout: 24 hours</li>
                    <li>• CSRF protection: Enabled</li>
                    <li>• IP validation: Enabled</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Security Headers</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Content Security Policy: Active</li>
                    <li>• HSTS: Enabled</li>
                    <li>• X-Frame-Options: DENY</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
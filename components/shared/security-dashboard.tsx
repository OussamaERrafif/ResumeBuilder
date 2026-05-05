"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Activity,
  Clock,
  Eye,
  RefreshCw
} from 'lucide-react'

interface SecurityLog {
  timestamp: string
  event: string
  ip: string
  userId?: string
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface SecurityStats {
  totalRequests: number
  blockedRequests: number
  suspiciousActivity: number
  blockedIPs: number
  activeUsers: number
  lastUpdate: string
}

export function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [stats, setStats] = useState<SecurityStats>({
    totalRequests: 0,
    blockedRequests: 0,
    suspiciousActivity: 0,
    blockedIPs: 0,
    activeUsers: 0,
    lastUpdate: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')

  useEffect(() => {
    loadSecurityData()
    const interval = setInterval(loadSecurityData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSecurityData = async () => {
    try {
      // In a real implementation, these would be API calls
      // For now, we'll simulate the data
      const mockLogs: SecurityLog[] = [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          event: 'RATE_LIMIT_EXCEEDED',
          ip: '192.168.1.100',
          details: 'API rate limit exceeded',
          severity: 'medium'
        },
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          event: 'SUSPICIOUS_HEADERS',
          ip: '10.0.0.1',
          details: 'Malicious user agent detected',
          severity: 'high'
        },
        {
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          event: 'LOGIN_FAILURE',
          ip: '203.0.113.1',
          userId: 'user123',
          details: 'Multiple failed login attempts',
          severity: 'medium'
        }
      ]

      const mockStats: SecurityStats = {
        totalRequests: 15420,
        blockedRequests: 23,
        suspiciousActivity: 5,
        blockedIPs: 2,
        activeUsers: 142,
        lastUpdate: new Date().toISOString()
      }

      setLogs(mockLogs)
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to load security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Eye className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const filteredLogs = logs.filter(log => 
    selectedSeverity === 'all' || log.severity === selectedSeverity
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading security data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor security events and system status
          </p>
        </div>
        <Button onClick={loadSecurityData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blockedRequests}</div>
            <p className="text-xs text-muted-foreground">Security blocks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blockedIPs}</div>
            <p className="text-xs text-muted-foreground">Currently blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Online now</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {stats.suspiciousActivity > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.suspiciousActivity} suspicious activities detected in the last hour. 
            Review the security logs below for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Security Events</CardTitle>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date(stats.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedSeverity} className="space-y-4 mt-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No security events found for the selected filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(log.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{log.event}</span>
                            <Badge variant={getSeverityColor(log.severity) as any} className="text-xs">
                              {log.severity}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>IP: {log.ip}</span>
                          {log.userId && <span>User: {log.userId}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
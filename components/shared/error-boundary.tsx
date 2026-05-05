/**
 * @fileoverview Enhanced Error Boundary with telemetry and recovery strategies
 * Production-ready error boundary with comprehensive error handling
 */

"use client"

import React, { Component, ReactNode, ErrorInfo } from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  isolate?: boolean
}

/**
 * Enhanced Error Boundary with recovery strategies and error reporting
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      eventId: generateErrorId(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // In production, you might want to send this to an error reporting service
    this.logErrorToService(error, errorInfo)
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Example: Send to error reporting service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
      eventId: this.state.eventId,
    }

    // In a real application, send this to your error tracking service
    // e.g., Sentry, LogRocket, Bugsnag, etc.
    if (process.env.NODE_ENV === 'production') {
      console.error('Error logged:', errorData)
      // sendToErrorService(errorData)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    })
  }

  private handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isIsolated = this.props.isolate
      const errorMessage = this.state.error?.message || 'An unexpected error occurred'
      
      return (
        <div className={`flex items-center justify-center p-4 ${
          isIsolated ? 'min-h-[200px]' : 'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        }`}>
          <Card className={`${
            isIsolated 
              ? 'border-destructive/50 bg-destructive/5' 
              : 'glass-dark border-white/20'
          } max-w-lg w-full`}>
            <CardHeader className="text-center">
              <div className={`w-16 h-16 ${
                isIsolated ? 'bg-destructive/20' : 'bg-red-500/20'
              } rounded-full flex items-center justify-center mx-auto mb-4`}>
                {isIsolated ? (
                  <Bug className={`h-8 w-8 ${isIsolated ? 'text-destructive' : 'text-red-400'}`} />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                )}
              </div>
              <CardTitle className={isIsolated ? 'text-foreground' : 'text-white'}>
                {isIsolated ? 'Component Error' : 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className={`${isIsolated ? 'text-muted-foreground' : 'text-white/60'} text-sm mb-3`}>
                  {isIsolated 
                    ? 'This component encountered an error and has been isolated.'
                    : 'We encountered an unexpected error. Please try one of the options below.'}
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <details className="text-left mb-4">
                    <summary className="cursor-pointer text-xs font-medium mb-2 hover:underline">
                      🔍 Error Details (Development)
                    </summary>
                    <div className="bg-muted/20 p-3 rounded text-xs font-mono break-all space-y-2">
                      <div><strong>Message:</strong> {errorMessage}</div>
                      {this.state.eventId && (
                        <div><strong>Event ID:</strong> {this.state.eventId}</div>
                      )}
                      {this.state.error?.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap text-[10px] mt-1">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
                
                {this.state.eventId && (
                  <Badge variant="outline" className="mb-3">
                    Error ID: {this.state.eventId}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.handleRetry}
                  variant={isIsolated ? "default" : "outline"}
                  className={`flex-1 ${
                    !isIsolated && "border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                {!isIsolated && (
                  <>
                    <Button
                      onClick={this.handleRefresh}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                    
                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

/**
 * Hook for programmatically triggering error boundary
 */
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    // In development, log the error
    if (process.env.NODE_ENV === 'development') {
      console.error('Manual error trigger:', error)
    }
    
    // Trigger error boundary by throwing
    throw error
  }, [])
}

/**
 * Generate unique error ID for tracking
 */
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

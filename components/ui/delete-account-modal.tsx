"use client"

import React, { useState } from "react"
import { AlertTriangle, Lock, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface DeleteAccountModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (password: string) => Promise<void>
  userEmail?: string
  isLoading?: boolean
}

export function DeleteAccountModal({
  isOpen,
  onOpenChange,
  onConfirm,
  userEmail,
  isLoading = false
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState<'warning' | 'confirmation' | 'password'>('warning')

  const handleReset = () => {
    setConfirmationText("")
    setPassword("")
    setStep('warning')
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      handleReset()
    }
    onOpenChange(open)
  }

  const handleNext = () => {
    if (step === 'warning') {
      setStep('confirmation')
    } else if (step === 'confirmation') {
      setStep('password')
    }
  }

  const handleBack = () => {
    if (step === 'password') {
      setStep('confirmation')
    } else if (step === 'confirmation') {
      setStep('warning')
    }
  }

  const handleConfirm = async () => {
    if (step === 'password' && password) {
      try {
        await onConfirm(password)
        handleReset()
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
  }

  const isConfirmationValid = confirmationText === "DELETE"
  const isPasswordValid = password.length >= 1
  const canProceed = 
    (step === 'warning') ||
    (step === 'confirmation' && isConfirmationValid) ||
    (step === 'password' && isPasswordValid)

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-red-600 dark:text-red-400">
            Delete Account
          </AlertDialogTitle>
          
          {step === 'warning' && (
            <AlertDialogDescription className="text-center space-y-4">
              <p>
                You are about to permanently delete your account and all associated data.
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  This action will permanently delete:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 text-left">
                  <li>• Your profile and personal information</li>
                  <li>• All created resumes and cover letters</li>
                  <li>• AI credits and subscription data</li>
                  <li>• Account preferences and settings</li>
                  <li>• All upload history and files</li>
                </ul>
              </div>
              
              <div className="flex items-center gap-2 justify-center">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  This action cannot be undone
                </Badge>
              </div>
            </AlertDialogDescription>
          )}

          {step === 'confirmation' && (
            <AlertDialogDescription className="text-center space-y-4">
              <p>
                To confirm account deletion, please type{" "}
                <span className="font-mono font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  DELETE
                </span>{" "}
                in the field below:
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="confirmation" className="text-sm font-medium">
                  Type "DELETE" to confirm
                </Label>
                <Input
                  id="confirmation"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="text-center font-mono"
                  autoComplete="off"
                  data-1p-ignore
                />
              </div>
              
              {confirmationText && !isConfirmationValid && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Please type "DELETE" exactly as shown
                </p>
              )}
            </AlertDialogDescription>
          )}

          {step === 'password' && (
            <AlertDialogDescription className="text-center space-y-4">
              <div className="flex items-center gap-2 justify-center mb-4">
                <Lock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Final Security Check
                </span>
              </div>
              
              <p>
                Please enter your current password to complete the account deletion:
              </p>
              
              {userEmail && (
                <p className="text-sm text-muted-foreground">
                  Account: {userEmail}
                </p>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Current Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <div className="flex gap-3 mt-6">
          {step !== 'warning' && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          
          {step === 'password' ? (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!canProceed || isLoading}
              className="flex-1 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          ) : (
            <Button
              variant={step === 'warning' ? 'destructive' : 'default'}
              onClick={handleNext}
              disabled={!canProceed || isLoading}
              className="flex-1"
            >
              {step === 'warning' ? 'Continue' : 'Next'}
            </Button>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

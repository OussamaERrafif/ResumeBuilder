"use client"

import React, { useState } from "react"
import { Lock, Eye, EyeOff, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface ChangePasswordModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
  isLoading?: boolean
}

export function ChangePasswordModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false
}: ChangePasswordModalProps) {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleReset = () => {
    setPasswords({
      current: "",
      new: "",
      confirm: ""
    })
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    })
    setValidationErrors([])
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      handleReset()
    }
    onOpenChange(open)
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push("At least 8 characters long")
    }
    if (!/\d/.test(password)) {
      errors.push("Contains at least one number")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Contains at least one lowercase letter")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Contains at least one uppercase letter")
    }
    
    return errors
  }

  React.useEffect(() => {
    if (passwords.new) {
      const errors = validatePassword(passwords.new)
      setValidationErrors(errors)
    } else {
      setValidationErrors([])
    }
  }, [passwords.new])

  const handleConfirm = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      return
    }

    if (passwords.new !== passwords.confirm) {
      return
    }

    if (validationErrors.length > 0) {
      return
    }

    try {
      await onConfirm(passwords.current, passwords.new, passwords.confirm)
      handleReset()
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  const isFormValid = 
    passwords.current.length > 0 &&
    passwords.new.length >= 8 &&
    passwords.confirm.length > 0 &&
    passwords.new === passwords.confirm &&
    validationErrors.length === 0

  const passwordsMatch = passwords.new === passwords.confirm
  const hasConfirmInput = passwords.confirm.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new secure password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-sm font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                placeholder="Enter current password"
                autoComplete="current-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                tabIndex={-1}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                tabIndex={-1}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* Password Requirements */}
            {passwords.new && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground mb-2">Password requirements:</p>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { text: "At least 8 characters long", valid: passwords.new.length >= 8 },
                    { text: "Contains at least one number", valid: /\d/.test(passwords.new) },
                    { text: "Contains at least one lowercase letter", valid: /[a-z]/.test(passwords.new) },
                    { text: "Contains at least one uppercase letter", valid: /[A-Z]/.test(passwords.new) },
                  ].map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {requirement.valid ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <X className="h-3 w-3 text-red-500" />
                      )}
                      <span className={requirement.valid ? "text-green-600" : "text-muted-foreground"}>
                        {requirement.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                tabIndex={-1}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* Password Match Indicator */}
            {hasConfirmInput && (
              <div className="flex items-center gap-2 text-xs">
                {passwordsMatch ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid || isLoading}
            className="flex-1 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Changing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

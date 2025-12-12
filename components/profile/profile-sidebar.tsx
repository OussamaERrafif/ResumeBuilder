"use client"

import React from "react"
import { motion } from "framer-motion"
import { User, Bell, CreditCard, Shield, Settings, Lock, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
  description: string
}

const sidebarItems: SidebarItem[] = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Personal information' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & alerts' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Credits & plans' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password & 2FA' },
  { id: 'preferences', label: 'Preferences', icon: Settings, description: 'Theme & language' },
  { id: 'privacy', label: 'Privacy', icon: Lock, description: 'Data controls' },
]

interface ProfileSidebarProps {
  activeSection: string
  setActiveSection: (id: string) => void
}

export function ProfileSidebar({ activeSection, setActiveSection }: ProfileSidebarProps) {
  return (
    <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
      {sidebarItems.map((item) => {
        const Icon = item.icon
        const isActive = activeSection === item.id
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "relative flex items-center gap-4 px-4 py-3 text-left rounded-xl transition-all duration-200 group whitespace-nowrap lg:whitespace-normal min-w-[200px] lg:min-w-0",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute left-0 w-1 h-8 bg-primary rounded-r-full hidden lg:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
            
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-background"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex flex-col">
              <span className={cn("font-medium text-sm", isActive && "font-semibold")}>
                {item.label}
              </span>
              <span className="text-xs text-muted-foreground hidden lg:block">
                {item.description}
              </span>
            </div>
          </button>
        )
      })}
    </nav>
  )
}

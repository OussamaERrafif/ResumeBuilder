import { User } from "lucide-react"

interface DefaultAvatarProps {
  className?: string
  size?: number
}

export function DefaultAvatar({ className = "w-24 h-24", size = 24 }: DefaultAvatarProps) {
  return (
    <div className={`${className} rounded-full bg-muted flex items-center justify-center border-2 border-border`}>
      <User className={`h-${size/2} w-${size/2} text-muted-foreground`} />
    </div>
  )
}

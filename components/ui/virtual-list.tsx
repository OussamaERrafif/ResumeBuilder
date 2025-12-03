"use client"

import type React from "react"
import { memo } from "react"

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

/**
 * Virtual list component for rendering large lists efficiently.
 * Uses simple overflow scroll for compatibility with react-window v2.
 * For very large lists (1000+ items), consider upgrading to use the new
 * react-window List API with proper virtualization.
 */
function VirtualListComponent<T>({ items, height, itemHeight, renderItem, className }: VirtualListProps<T>) {
  return (
    <div 
      className={className} 
      style={{ 
        height, 
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {items.map((item, index) => (
        <div key={index} style={{ height: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}

VirtualListComponent.displayName = "VirtualList"

export const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent

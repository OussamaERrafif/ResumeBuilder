"use client"

import type React from "react"
import { memo, useMemo } from "react"
import { FixedSizeList as List } from "react-window"

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

export const VirtualList = memo(<T,>({ items, height, itemHeight, renderItem, className }: VirtualListProps<T>) => {
  const Row = useMemo(
    () =>
      ({ index, style }: { index: number; style: React.CSSProperties }) => (
        <div style={style}>{renderItem(items[index], index)}</div>
      ),
    [items, renderItem],
  )

  return (
    <div className={className}>
      <List height={height} itemCount={items.length} itemSize={itemHeight} width="100%">
        {Row}
      </List>
    </div>
  )
})

VirtualList.displayName = "VirtualList"

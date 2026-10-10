// Staggered grid helpers shared by the work grid and the Info page photos
import { useEffect, useState } from 'react'

// 3 columns on laptops, 2 on tablets, 1 on phones
export function useColumnCount() {
  const get = () => (innerWidth >= 1000 ? 3 : innerWidth >= 640 ? 2 : 1)
  const [n, setN] = useState(get)
  useEffect(() => {
    const resize = () => setN(get())
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  return n
}

// Fill columns left to right, always adding to the shortest one, so the grid staggers but stays balanced
export function distribute<T extends { aspect: string }>(items: T[], n: number) {
  const cols: T[][] = Array.from({ length: n }, () => [])
  const heights = new Array(n).fill(0)
  items.forEach(p => {
    const [w, h] = p.aspect.split('/').map(Number)
    const i = heights.indexOf(Math.min(...heights))
    cols[i].push(p)
    heights[i] += h / w + 0.25 // + caption (meta line, title, summary)
  })
  return cols
}

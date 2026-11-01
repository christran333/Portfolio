// Staggered grid helpers shared by the work grid and the Info page photos
import { useEffect, useState } from 'react'

// 3 columns on laptops, 2 on tablets, 1 on phones. The grid's CSS reads this same number
// (via --cols), so JS and CSS can never disagree about how many columns there are.
const THREE = '(min-width: 1024px)'
const TWO = '(min-width: 640px)'
export function useColumnCount() {
  const get = () => (matchMedia(THREE).matches ? 3 : matchMedia(TWO).matches ? 2 : 1)
  const [n, setN] = useState(get)
  useEffect(() => {
    const queries = [matchMedia(THREE), matchMedia(TWO)]
    const update = () => setN(get())
    queries.forEach(q => q.addEventListener('change', update))
    return () => queries.forEach(q => q.removeEventListener('change', update))
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

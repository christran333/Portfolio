import { useEffect, useRef } from 'react'

// Adds .is-in to every .reveal inside the returned ref once it scrolls into view.
// Also picks up .reveal elements added later: when the window crosses a breakpoint the grid
// re-deals tiles into new columns, and those new elements would otherwise stay invisible.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        e.target.classList.add('is-in')
        io.unobserve(e.target)
      })
    }, { rootMargin: '0px 0px -8% 0px' })
    const watch = (scope: ParentNode) =>
      scope.querySelectorAll('.reveal:not(.is-in)').forEach(el => io.observe(el))
    watch(root)
    const mo = new MutationObserver(records => {
      records.forEach(r => r.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return
        if (node.matches('.reveal:not(.is-in)')) io.observe(node)
        watch(node)
      }))
    })
    mo.observe(root, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])
  return ref
}

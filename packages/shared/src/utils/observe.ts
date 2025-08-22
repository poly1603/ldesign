export default function observe(
  element: HTMLElement,
  root: HTMLElement,
  callback: () => void,
  marginBottom: number,
): IntersectionObserver {
  if (typeof window === 'undefined')
    return new IntersectionObserver(() => { })
  if (!window || !window.IntersectionObserver) {
    callback()
    return new IntersectionObserver(() => { })
  }
  let io: IntersectionObserver = null as unknown as IntersectionObserver
  try {
    io = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          callback()
          io.unobserve(element)
        }
      },
      {
        rootMargin: `0px 0px ${marginBottom}px 0px`,
        root,
      },
    )
    io.observe(element)
  }
  catch (e) {
    console.error(e)
    callback()
  }
  return io
}

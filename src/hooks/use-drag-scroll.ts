"use client"
import { useRef } from "react"

/** Trascinamento col mouse di un'area scorrevole; i clic sui pulsanti interni restano clic. */
export function useDragScroll() {
  const drag = useRef<[number, number, number, number] | null>(null)
  return {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || (event.target as HTMLElement).closest("button")) return
      const el = event.currentTarget
      drag.current = [event.clientX, event.clientY, el.scrollLeft, el.scrollTop]
      el.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (!drag.current) return
      event.currentTarget.scrollTo(drag.current[2] + drag.current[0] - event.clientX, drag.current[3] + drag.current[1] - event.clientY)
    },
    onLostPointerCapture: () => {
      drag.current = null
    },
  }
}

import { PointerSensor } from '@dnd-kit/core'

/**
 * PointerSensor that skips activation on interactive elements (input, textarea, button).
 * Prevents DnD context re-renders from blocking keyboard input.
 */
export class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: e }: { nativeEvent: PointerEvent }) => {
        if (!e.isPrimary || e.button !== 0) return false
        const el = e.target as HTMLElement
        if (
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'BUTTON' ||
          el.isContentEditable
        ) return false
        return true
      },
    },
  ]
}

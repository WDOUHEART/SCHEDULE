'use client'

interface FABProps {
  onClick?: () => void
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="添加待办"
      className="fixed right-5 bottom-11 w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center text-[22px] shadow-[0_4px_14px_rgba(43,168,122,0.35)] hover:bg-accent2 hover:scale-105 active:scale-95 transition-all z-30 font-body"
    >
      +
    </button>
  )
}

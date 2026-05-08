'use client'

import { useRef, useEffect, useState, useTransition } from 'react'
import { createTodo } from '@/app/actions/todos'

interface InlineAddProps {
  date: Date
  startTime?: Date
  onDone: () => void
  onAdd: () => void
}

export default function InlineAdd({ date, startTime, onDone, onAdd }: InlineAddProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [important, setImportant] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onDone(); return }
    if (e.key === 'Enter' && title.trim()) { e.preventDefault(); submit() }
  }

  function submit() {
    if (!title.trim() || pending) return
    startTransition(async () => {
      await createTodo({ title: title.trim(), date, startTime, important })
      setTitle('')
      setImportant(false)
      onAdd()
    })
  }

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-1 mt-1 bg-white rounded-md border border-accent/30 shadow-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[11px] text-ink3 flex-shrink-0">✏</span>
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="写点什么..."
        disabled={pending}
        className="flex-1 text-[12px] font-hand text-ink bg-transparent border-none outline-none placeholder:text-ink3 placeholder:italic placeholder:text-[11px] min-w-0"
      />
      {/* 重要标记 — 用背景色变化确保状态清晰可见 */}
      <button
        onClick={() => setImportant(!important)}
        title="标为重要"
        className={`flex-shrink-0 flex items-center gap-0.5 rounded px-1 py-0.5 text-[11px] leading-none transition-all ${
          important
            ? 'bg-warm-bg border border-warm-mid/60 text-warm font-semibold shadow-sm'
            : 'text-ink3/50 border border-transparent hover:border-line hover:text-ink3'
        }`}
      >
        🚩
        {important && <span className="text-[10px] font-body">重要</span>}
      </button>
      <button
        onClick={submit}
        disabled={!title.trim() || pending}
        className="text-[13px] text-accent disabled:opacity-30 hover:text-accent2 transition-colors flex-shrink-0"
        title="添加（Enter）"
      >
        ↩
      </button>
    </div>
  )
}

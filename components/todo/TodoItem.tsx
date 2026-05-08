'use client'

import { useState, useEffect } from 'react'
import { updateTodoStatus, toggleTodoImportant, deleteTodo } from '@/app/actions/todos'
import type { Todo, TodoStatus } from '@/types'
import { cn } from '@/lib/utils'

// 状态循环：PENDING → DONE → SKIPPED → PENDING
const NEXT_STATUS: Record<TodoStatus, TodoStatus> = {
  PENDING: 'DONE',
  DONE: 'SKIPPED',
  SKIPPED: 'PENDING',
  OVERDUE: 'DONE',
}

// 状态圆圈的样式
const STATUS_CIRCLE: Record<TodoStatus, { cls: string; icon: string }> = {
  PENDING: { cls: 'border-[1.5px] border-ink3 hover:border-accent', icon: '' },
  DONE:    { cls: 'bg-accent border-accent', icon: '✓' },
  SKIPPED: { cls: 'bg-skip-bg border-skip-bg', icon: '~' },
  OVERDUE: { cls: 'bg-red-bg border-red border-[1.5px]', icon: '✕' },
}

interface TodoItemProps {
  todo: Todo
  variant?: 'chip' | 'full'
  onUpdate?: () => void
}

export default function TodoItem({ todo, variant = 'chip', onUpdate }: TodoItemProps) {
  const [localStatus, setLocalStatus] = useState<TodoStatus>(todo.status)
  const [localImportant, setLocalImportant] = useState(todo.important)

  useEffect(() => { setLocalStatus(todo.status) }, [todo.status])
  useEffect(() => { setLocalImportant(todo.important) }, [todo.important])

  const circle = STATUS_CIRCLE[localStatus]

  function handleStatusClick(e: React.MouseEvent) {
    e.stopPropagation()
    const next = NEXT_STATUS[localStatus]
    setLocalStatus(next)
    updateTodoStatus(todo.id, next).then(() => onUpdate?.())
  }

  function handleImportantClick(e: React.MouseEvent) {
    e.stopPropagation()
    setLocalImportant((v) => !v)
    toggleTodoImportant(todo.id).then(() => onUpdate?.())
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    deleteTodo(todo.id).then(() => onUpdate?.())
  }

  const isDone = localStatus === 'DONE'
  const isSkipped = localStatus === 'SKIPPED'
  const isOverdue = localStatus === 'OVERDUE'

  // ── 月视图迷你条目 ──
  if (variant === 'chip') {
    return (
      <div
        className={cn(
          'group flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer transition-colors min-w-0',
          'hover:bg-black/[.04]',
        )}
      >
        {/* 状态圆圈 */}
        <button
          onClick={handleStatusClick}
          className={cn(
            'w-[13px] h-[13px] rounded-full flex items-center justify-center text-[8px] flex-shrink-0 border transition-colors',
            circle.cls,
            isDone && 'text-white',
            isSkipped && 'text-ink3',
          )}
        >
          {circle.icon}
        </button>

        {/* 标题 */}
        <span
          className={cn(
            'text-[11px] font-hand flex-1 truncate',
            isDone && 'line-through text-ink3',
            isSkipped && 'text-ink3',
            isOverdue && 'text-red',
          )}
        >
          {todo.title}
        </span>

        {/* 重要旗 */}
        {localImportant && (
          <span
            onClick={handleImportantClick}
            className={cn('text-[9px] flex-shrink-0 ml-auto', isDone ? 'opacity-40' : 'text-warm-mid')}
          >
            🚩
          </span>
        )}

        {/* hover 时删除按钮 */}
        <button
          onClick={handleDelete}
          className="text-[9px] text-ink3 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-red flex-shrink-0"
        >
          ✕
        </button>
      </div>
    )
  }

  // ── 日视图/侧边栏完整条目 ──
  return (
    <div
      className={cn(
        'group flex items-start gap-2.5 px-3.5 py-2.5 border-b border-line cursor-pointer transition-colors',
        'hover:bg-paper2',
      )}
    >
      {/* 状态圆圈 */}
      <button
        onClick={handleStatusClick}
        className={cn(
          'w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 border transition-colors',
          circle.cls,
          isDone && 'text-white',
          isSkipped && 'text-ink3',
        )}
      >
        {circle.icon}
      </button>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-[14px] font-hand leading-snug',
            isDone && 'line-through text-ink3',
            isSkipped && 'text-ink3',
            isOverdue && 'text-red',
          )}
        >
          {todo.title}
        </div>
        {todo.note && (
          <div className="text-[11px] text-ink3 mt-0.5 truncate">{todo.note}</div>
        )}
      </div>

      {/* 右侧操作 */}
      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
        <button
          onClick={handleImportantClick}
          className={cn(
            'text-[14px] transition-colors',
            localImportant
              ? isDone ? 'opacity-40 text-warm-mid' : 'text-warm-mid'
              : 'text-ink3 opacity-0 group-hover:opacity-60 hover:!opacity-100',
          )}
          title={localImportant ? '取消重要' : '标为重要'}
        >
          🚩
        </button>
        <button
          onClick={handleDelete}
          className="text-[12px] text-ink3 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red transition-all"
          title="删除"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

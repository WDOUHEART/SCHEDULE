'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { createTodo } from '@/app/actions/todos'
import TodoItem from '@/components/todo/TodoItem'
import type { Todo } from '@/types'

interface SidebarProps {
  onTodosChange?: () => void
  dragEnabled?: boolean       // 是否启用拖拽（只在 MonthView 中开启）
  refreshTrigger?: number     // 外部触发刷新（拖拽排期后）
}

// 可拖拽的单条待排期 Todo
function DraggableTodoChip({ todo, onDelete }: { todo: Todo; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: todo.id,
    data: { title: todo.title, important: todo.important },
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`transition-opacity touch-none ${isDragging ? 'opacity-30' : ''}`}
    >
      <TodoItem todo={todo} variant="chip" onDelete={onDelete} />
    </div>
  )
}

export default function Sidebar({ onTodosChange, dragEnabled, refreshTrigger }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const [pendingOpen, setPendingOpen] = useState(true)
  const [unscheduled, setUnscheduled] = useState<Todo[]>([])
  const [addTitle, setAddTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchUnscheduled = useCallback(async () => {
    const res = await fetch('/api/todos?unscheduled=1')
    const data = await res.json()
    setUnscheduled(
      (data.todos as Todo[]).map((t) => ({
        ...t,
        date: t.date ? new Date(t.date) : null,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })),
    )
  }, [])

  useEffect(() => {
    if (open) fetchUnscheduled()
  }, [open, fetchUnscheduled, refreshTrigger])

  function handleAdd(e: React.KeyboardEvent) {
    if (e.key !== 'Enter' || !addTitle.trim()) return
    const t = addTitle.trim()
    setAddTitle('')
    const tempId = `opt-${Date.now()}`
    const now = new Date()
    setUnscheduled((prev) => [...prev, {
      id: tempId, title: t, important: false, status: 'PENDING',
      date: null, startTime: null, endTime: null, note: null,
      deadline: null, isRecurring: false, recurRule: null, recurGroupId: null,
      createdAt: now, updatedAt: now, userId: null,
    }])
    createTodo({ title: t }).then((real) =>
      setUnscheduled((prev) => prev.map((todo) => todo.id === tempId ? real : todo))
    )
  }

  return (
    <div className="relative flex-shrink-0 h-full">
      {/* 侧边栏面板 */}
      <div
        className={`h-full overflow-hidden transition-all duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)] ${
          open ? 'w-[200px]' : 'w-0'
        } bg-paper2 border-r border-line flex flex-col`}
      >
        {/* 待排期区 */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <button
            onClick={() => setPendingOpen(!pendingOpen)}
            className="w-full px-3.5 py-2 flex items-center gap-1.5 hover:bg-black/[.03] text-left flex-shrink-0"
          >
            <span className="text-[13px]">🏠</span>
            <span className="text-[12px] text-ink2 font-medium flex-1">待排期</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-accent-bg text-accent font-num font-semibold">
              {unscheduled.length}
            </span>
            <span className={`text-[10px] text-ink3 transition-transform ${pendingOpen ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {pendingOpen && (
            <div className="overflow-y-auto flex-1">
              {unscheduled.length === 0 ? (
                <p className="text-[11px] text-ink3 italic px-3.5 py-2">暂无待排期任务 🌱</p>
              ) : (
                unscheduled.map((todo) =>
                  dragEnabled ? (
                    <DraggableTodoChip
                      key={todo.id}
                      todo={todo}
                      onDelete={(id) => setUnscheduled((prev) => prev.filter((t) => t.id !== id))}
                    />
                  ) : (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      variant="chip"
                      onDelete={(id) => setUnscheduled((prev) => prev.filter((t) => t.id !== id))}
                    />
                  )
                )
              )}
            </div>
          )}

          {/* 快速添加无日期 Todo */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 border-t border-line flex-shrink-0">
            <input
              ref={inputRef}
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              onKeyDown={handleAdd}
              placeholder="快速添加..."
              className="flex-1 bg-transparent text-[12px] font-hand text-ink placeholder:text-ink3 placeholder:italic placeholder:text-[11px] border-none outline-none"
            />
            <button
              onClick={() => {
                if (addTitle.trim()) {
                  const t = addTitle.trim()
                  setAddTitle('')
                  const tempId = `opt-${Date.now()}`
                  const now = new Date()
                  setUnscheduled((prev) => [...prev, {
                    id: tempId, title: t, important: false, status: 'PENDING',
                    date: null, startTime: null, endTime: null, note: null,
                    deadline: null, isRecurring: false, recurRule: null, recurGroupId: null,
                    createdAt: now, updatedAt: now, userId: null,
                  }])
                  createTodo({ title: t }).then((real) =>
                    setUnscheduled((prev) => prev.map((todo) => todo.id === tempId ? real : todo))
                  )
                }
              }}
              className="text-[17px] text-accent leading-none"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 展开/收起 Tab */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-1/2 -translate-y-1/2 left-0 z-20 flex items-center justify-center px-1.5 bg-paper2 border border-l-0 border-line rounded-r-[10px] shadow-sm hover:bg-accent-bg hover:text-accent transition-all h-20"
      >
        <span className="[writing-mode:vertical-rl] text-[11px] text-ink2 flex items-center gap-1">
          <span className={`text-[9px] text-ink3 transition-transform duration-250 ${open ? 'rotate-180' : ''}`}>▶</span>
          清单
        </span>
      </button>
    </div>
  )
}

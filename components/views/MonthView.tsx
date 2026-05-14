'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  TouchSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SmartPointerSensor } from '@/lib/dnd'
import Sidebar from '@/components/layout/Sidebar'
import TodoItem from '@/components/todo/TodoItem'
import InlineAdd from '@/components/todo/InlineAdd'
import { scheduleTodo } from '@/app/actions/todos'
import { useViewStore } from '@/store/viewStore'
import { isToday, isSameDay } from '@/lib/utils'
import type { Todo } from '@/types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const days: Date[] = []
  for (let i = 0; i < first.getDay(); i++) {
    days.push(new Date(year, month, -first.getDay() + i + 1))
  }
  const last = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= last; d++) days.push(new Date(year, month, d))
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) days.push(new Date(year, month + 1, i))
  return days
}

// ── 月视图可拖拽 Todo 条目 ─────────────────────────────
function DraggableMonthChip({ todo, onDelete }: { todo: Todo; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: todo.id,
    data: { title: todo.title, important: todo.important },
  })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      className={`touch-none select-none ${isDragging ? 'opacity-30' : ''}`}
    >
      <TodoItem todo={todo} variant="chip" onDelete={onDelete} />
    </div>
  )
}

// ── 可放置的日期格 ──────────────────────────────────────
interface DroppableCellProps {
  day: Date
  idx: number
  isCurrentMonth: boolean
  today: boolean
  isWeekend: boolean
  isActive: boolean
  isExpanded: boolean
  dayTodos: Todo[]
  onCellClick: (day: Date) => void
  onMoreClick: (e: React.MouseEvent, day: Date) => void
  onInlineDone: () => void
  onInlineAdd: (todo: Todo) => void
  onInlineCommit: (tempId: string, realTodo: Todo) => void
  onDelete: (id: string) => void
}

function DroppableCell({
  day, idx, isCurrentMonth, today, isWeekend, isActive, isExpanded,
  dayTodos, onCellClick, onMoreClick, onInlineDone, onInlineAdd, onInlineCommit, onDelete,
}: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: day.toISOString() })
  const shown = isExpanded ? dayTodos : dayTodos.slice(0, 3)
  const extra = dayTodos.length - shown.length

  return (
    <div
      ref={setNodeRef}
      onClick={() => onCellClick(day)}
      className={`border-r border-b border-line p-1 min-h-[90px] transition-all cursor-pointer flex flex-col
        ${idx % 7 === 6 ? 'border-r-0' : ''}
        ${!isCurrentMonth ? 'bg-black/[.01]' : ''}
        ${today && !isOver ? 'bg-accent/[.05]' : ''}
        ${isOver
          ? 'bg-accent-bg/70 ring-2 ring-inset ring-accent/50 scale-[0.98]'
          : isActive
          ? 'bg-accent-bg/60 ring-1 ring-inset ring-accent/30'
          : 'hover:bg-paper2'}`}
    >
      {/* 日期数字 */}
      <div className={`flex items-center gap-0.5 mb-0.5 font-num text-[13px] leading-none flex-shrink-0
        ${!isCurrentMonth ? 'opacity-40' : ''}
        ${isWeekend && isCurrentMonth ? 'text-red' : 'text-ink2'}`}
      >
        {today ? (
          <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[11px]">
            {day.getDate()}
          </span>
        ) : (
          <span>{day.getDate()}</span>
        )}
      </div>

      {/* 拖拽放置提示 */}
      {isOver && (
        <div className="text-[10px] text-accent font-body text-center py-1 flex-shrink-0">
          松手排到这天
        </div>
      )}

      {/* Todo 条目 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {shown.map((todo) => (
          <DraggableMonthChip key={todo.id} todo={todo} onDelete={onDelete} />
        ))}
        {extra > 0 && (
          <button
            onClick={(e) => onMoreClick(e, day)}
            className="text-[10px] text-accent px-1 py-0.5 hover:underline text-left w-full"
          >
            +{extra} 更多
          </button>
        )}
        {isExpanded && dayTodos.length > 3 && (
          <button
            onClick={(e) => onMoreClick(e, day)}
            className="text-[10px] text-ink3 px-1 py-0.5 hover:text-ink2 text-left w-full"
          >
            收起
          </button>
        )}
      </div>

      {/* 内联输入框 */}
      {isActive && (
        <InlineAdd date={day} onDone={onInlineDone} onAdd={onInlineAdd} onCommit={onInlineCommit} />
      )}
    </div>
  )
}

// ── MonthView 主体 ──────────────────────────────────────
export default function MonthView() {
  const { currentDate } = useViewStore()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days = getDaysInMonth(year, month)

  const [todos, setTodos] = useState<Todo[]>([])
  const [activeDay, setActiveDay] = useState<Date | null>(null)
  const [expandedDay, setExpandedDay] = useState<Date | null>(null)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)
  const [activeDragData, setActiveDragData] = useState<{ title: string; important: boolean } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 拖拽传感器：鼠标移动 8px 或触屏长按 250ms 才触发
  const sensors = useSensors(
    useSensor(SmartPointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const fetchTodos = useCallback(async () => {
    const res = await fetch(`/api/todos?year=${year}&month=${month + 1}`)
    const data = await res.json()
    setTodos(
      (data.todos as Todo[]).map((t) => ({
        ...t,
        date: t.date ? new Date(t.date) : null,
        startTime: t.startTime ? new Date(t.startTime) : null,
        endTime: t.endTime ? new Date(t.endTime) : null,
        deadline: t.deadline ? new Date(t.deadline) : null,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })),
    )
  }, [year, month])

  useEffect(() => {
    fetchTodos()
    setActiveDay(null)
  }, [fetchTodos])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDay(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function todosForDay(day: Date) {
    return todos.filter((t) => t.date && isSameDay(new Date(t.date), day))
  }

  function handleCellClick(day: Date) {
    setActiveDay((prev) => (prev && isSameDay(prev, day) ? null : day))
  }

  function handleMoreClick(e: React.MouseEvent, day: Date) {
    e.stopPropagation()
    setExpandedDay((prev) => (prev && isSameDay(prev, day) ? null : day))
  }

  // ── 拖拽处理 ──
  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { title: string; important: boolean } | undefined
    setActiveDragData(data ?? { title: String(event.active.id), important: false })
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragData(null)
    const { active, over } = event
    if (!over) return
    const todoId = active.id as string
    const date = new Date(over.id as string)
    await scheduleTodo(todoId, date)
    fetchTodos()
    setSidebarRefreshKey((k) => k + 1) // 触发 Sidebar 刷新
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          onTodosChange={fetchTodos}
          dragEnabled
          refreshTrigger={sidebarRefreshKey}
        />

        <div className="flex flex-col flex-1 overflow-hidden" style={{ paddingLeft: 16, paddingRight: 16 }} ref={containerRef}>
          {/* 星期头 */}
          <div className="grid grid-cols-7 border-b border-line flex-shrink-0">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`py-1.5 text-[13px] text-center font-num border-r last:border-r-0 border-line ${
                  i === 0 || i === 6 ? 'text-red' : 'text-ink3'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 日期格 */}
          <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ paddingBottom: 16 }}>
            {days.map((day, idx) => (
              <DroppableCell
                key={idx}
                day={day}
                idx={idx}
                isCurrentMonth={day.getMonth() === month}
                today={isToday(day)}
                isWeekend={day.getDay() === 0 || day.getDay() === 6}
                isActive={activeDay !== null && isSameDay(activeDay, day)}
                isExpanded={expandedDay !== null && isSameDay(expandedDay, day)}
                dayTodos={todosForDay(day)}
                onCellClick={handleCellClick}
                onMoreClick={handleMoreClick}
                onInlineDone={() => setActiveDay(null)}
                onInlineAdd={(todo) => { setTodos((prev) => [...prev, todo]); setActiveDay(null) }}
                onInlineCommit={(tempId, real) => setTodos((prev) => prev.map((t) => t.id === tempId ? real : t))}
                onDelete={(id) => setTodos((prev) => prev.filter((t) => t.id !== id))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 拖拽时跟随鼠标的预览卡片 */}
      <DragOverlay dropAnimation={null}>
        {activeDragData && (
          <div className="bg-white border border-accent/40 rounded-md px-2.5 py-1.5 text-[12px] font-body text-ink shadow-lg cursor-grabbing flex items-center gap-1 max-w-[180px]">
            {activeDragData.important && <span className="text-[10px]">🚩</span>}
            <span className="truncate">{activeDragData.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

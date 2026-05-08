'use client'

import { useState, useEffect, useCallback, useTransition, useRef } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useDroppable, useDraggable, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { createTodo, setTodoTime, setTodoEndTime } from '@/app/actions/todos'
import InlineAdd from '@/components/todo/InlineAdd'
import TodoItem from '@/components/todo/TodoItem'
import { useViewStore } from '@/store/viewStore'
import type { Todo } from '@/types'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7)
const SLOT_H = 52 // px per hour

// 计算重叠时间块的列布局
function computeLayout(todos: Todo[]): Map<string, { col: number; numCols: number }> {
  if (todos.length === 0) return new Map()

  const getRange = (t: Todo): [number, number] => {
    const st = new Date(t.startTime!)
    const s = st.getHours() + st.getMinutes() / 60
    const e = t.endTime
      ? (() => { const et = new Date(t.endTime!); return et.getHours() + et.getMinutes() / 60 })()
      : s + 1
    return [s, e]
  }

  const overlaps = (a: Todo, b: Todo) => {
    const [as, ae] = getRange(a); const [bs, be] = getRange(b)
    return as < be && ae > bs
  }

  const sorted = [...todos].sort((a, b) => getRange(a)[0] - getRange(b)[0])
  const colOf = new Map<string, number>()

  for (const t of sorted) {
    const used = new Set(sorted.filter(o => o.id !== t.id && colOf.has(o.id) && overlaps(t, o)).map(o => colOf.get(o.id)!))
    let col = 0; while (used.has(col)) col++
    colOf.set(t.id, col)
  }

  const result = new Map<string, { col: number; numCols: number }>()
  for (const t of sorted) {
    const col = colOf.get(t.id)!
    const numCols = sorted.filter(o => overlaps(t, o)).reduce((m, o) => Math.max(m, colOf.get(o.id)! + 1), col + 1)
    result.set(t.id, { col, numCols })
  }
  return result
}

// ── 左侧：可拖拽 Todo 行 ───────────────────────────────
function DraggableTodoRow({ todo, onUpdate }: { todo: Todo; onUpdate: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: todo.id,
    data: { title: todo.title, important: todo.important },
  })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      className={`touch-none select-none ${isDragging ? 'opacity-30' : ''}`}
    >
      <TodoItem todo={todo} variant="full" onUpdate={onUpdate} />
    </div>
  )
}

// ── 右侧：可放置的时间格（仅接收拖拽 + 内联添加）─────
function DroppableHourSlot({
  hour, date, isActive, onOpen, onClose, onAdd,
}: {
  hour: number; date: Date; isActive: boolean
  onOpen: () => void; onClose: () => void; onAdd: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-slot-${hour}`, data: { hour, date } })
  return (
    <div
      ref={setNodeRef}
      onClick={() => !isActive && onOpen()}
      className={`flex-1 relative cursor-pointer transition-colors group ${
        isOver ? 'bg-accent-bg/50' : isActive ? 'bg-accent-bg/20' : 'hover:bg-paper2'
      }`}
    >
      {isActive && (
        <div className="absolute inset-x-0 bottom-0 z-30 p-1" onClick={(e) => e.stopPropagation()}>
          <InlineAdd
            date={date}
            startTime={new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0)}
            onDone={onClose}
            onAdd={onAdd}
          />
        </div>
      )}
      {!isActive && !isOver && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-accent/60
          opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
          + 添加待办
        </span>
      )}
    </div>
  )
}

// ── 时间块：绝对定位 + 底部拖拽调整结束时间 ────────────
function TimeBlockItem({ todo, col, numCols, onUpdate }: {
  todo: Todo; col: number; numCols: number; onUpdate: () => void
}) {
  const st = new Date(todo.startTime!)
  const startDec = st.getHours() + st.getMinutes() / 60

  const initEnd = todo.endTime
    ? (() => { const et = new Date(todo.endTime!); return et.getHours() + et.getMinutes() / 60 })()
    : startDec + 1

  const [endDec, setEndDec] = useState(initEnd)
  const dragRef = useRef<{ startY: number; initEnd: number } | null>(null)

  const top = (startDec - HOURS[0]) * SLOT_H
  const height = Math.max(SLOT_H / 2, (endDec - startDec) * SLOT_H)

  const fmt = (d: number) =>
    `${Math.floor(d)}:${String(Math.round((d % 1) * 60)).padStart(2, '0')}`

  function onResizeDown(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    dragRef.current = { startY: e.clientY, initEnd: endDec }

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dy = ev.clientY - dragRef.current.startY
      const snapped = Math.round((dy / SLOT_H) * 2) / 2
      setEndDec(Math.max(startDec + 0.5, dragRef.current.initEnd + snapped))
    }

    const onUp = async (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!dragRef.current) return
      const dy = ev.clientY - dragRef.current.startY
      const snapped = Math.round((dy / SLOT_H) * 2) / 2
      const newEnd = Math.max(startDec + 0.5, dragRef.current.initEnd + snapped)
      setEndDec(newEnd)
      const endDate = new Date(todo.date!)
      endDate.setHours(Math.floor(newEnd), Math.round((newEnd % 1) * 60), 0, 0)
      await setTodoEndTime(todo.id, endDate)
      onUpdate()
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const imp = todo.important
  const bg = imp ? 'rgba(245,166,35,0.13)' : 'rgba(91,184,122,0.13)'
  const borderColor = imp ? '#F5A623' : '#5BB87A'
  const textColor = imp ? '#9A6A10' : '#2A6A48'

  const leftPct = (col / numCols) * 100
  const widthPct = (1 / numCols) * 100

  return (
    <div
      className="absolute rounded-md overflow-hidden select-none"
      style={{
        top: `${top}px`,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        height: `${height}px`,
        background: bg,
        borderLeft: `3px solid ${borderColor}`,
        zIndex: 15,
        pointerEvents: 'none', // 主体不拦截点击，让格子的 click 事件正常触发
      }}
    >
      <div className="px-2 pt-1 pb-4 overflow-hidden">
        <div className="font-body text-[11px] font-semibold truncate" style={{ color: textColor }}>
          {todo.title}
        </div>
        {height > 36 && (
          <div className="font-num text-[9px] mt-0.5 opacity-70" style={{ color: textColor }}>
            {fmt(startDec)} – {fmt(endDec)}
          </div>
        )}
      </div>
      {/* 底部拖拽手柄：单独启用 pointer-events */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 cursor-s-resize flex items-center justify-center"
        style={{ pointerEvents: 'auto' }}
        onMouseDown={onResizeDown}
      >
        <div className="w-8 h-[3px] rounded-full opacity-40" style={{ background: borderColor }} />
      </div>
    </div>
  )
}

// ── DayView 主体 ───────────────────────────────────────
export default function DayView() {
  const { currentDate } = useViewStore()
  const [todos, setTodos] = useState<Todo[]>([])
  const [quickTitle, setQuickTitle] = useState('')
  const [addPending, startAdd] = useTransition()
  const [activeHour, setActiveHour] = useState<number | null>(null)
  const [activeDragData, setActiveDragData] = useState<{ title: string; important: boolean } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`

  const fetchTodos = useCallback(async () => {
    const res = await fetch(`/api/todos?date=${dateStr}`)
    const data = await res.json()
    setTodos(
      (data.todos as Todo[]).map((t) => ({
        ...t,
        date: t.date ? new Date(t.date) : null,
        startTime: t.startTime ? new Date(t.startTime) : null,
        endTime: t.endTime ? new Date(t.endTime) : null,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })),
    )
  }, [dateStr])

  useEffect(() => { fetchTodos(); setActiveHour(null) }, [fetchTodos])

  const dateLabel = currentDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
  const done = todos.filter((t) => t.status === 'DONE').length
  const pct = todos.length > 0 ? Math.round((done / todos.length) * 100) : 0

  function handleQuickAdd(e: React.KeyboardEvent) {
    if (e.key !== 'Enter' || !quickTitle.trim() || addPending) return
    startAdd(async () => {
      await createTodo({ title: quickTitle.trim(), date: currentDate })
      setQuickTitle('')
      await fetchTodos()
    })
  }

  function handleDragStart(event: DragStartEvent) {
    const d = event.active.data.current as { title: string; important: boolean } | undefined
    setActiveDragData(d ?? { title: String(event.active.id), important: false })
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragData(null)
    const { active, over } = event
    if (!over) return
    const { hour, date } = over.data.current as { hour: number; date: Date }
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0)
    await setTodoTime(active.id as string, date, startTime)
    fetchTodos()
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 overflow-hidden relative px-4">

        {/* ── 左侧：Todo 列表 ── */}
        <div className="w-[272px] flex-shrink-0 border-r border-line flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between flex-shrink-0">
            <span className="text-[12px] text-ink2 font-body">{dateLabel}</span>
            <button
              onClick={() => inputRef.current?.focus()}
              className="w-6 h-6 rounded-full bg-accent-bg text-accent flex items-center justify-center text-[16px] leading-none hover:bg-accent hover:text-white transition-colors"
            >+</button>
          </div>
          <div className="px-4 py-2.5 border-b border-line flex-shrink-0">
            <div className="h-[5px] bg-line rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-ink3 font-body">
              <span>{done} / {todos.length} 完成</span>
              <span className="text-accent font-semibold">{pct}%</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-ink3">
                <span className="text-[28px]">🌱</span>
                <span className="text-[12px] font-body">今日暂无待办</span>
                <button onClick={() => inputRef.current?.focus()}
                  className="text-[11px] text-accent border border-accent/30 rounded-full px-3 py-1 hover:bg-accent-bg transition-colors">
                  + 添加一条
                </button>
              </div>
            ) : (
              todos.map((todo) => (
                <DraggableTodoRow key={todo.id} todo={todo} onUpdate={fetchTodos} />
              ))
            )}
          </div>
          <div className="border-t border-line px-4 py-2.5 flex items-center gap-2 flex-shrink-0 bg-paper">
            <span className="text-[13px] text-ink3">✏</span>
            <input ref={inputRef} value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={handleQuickAdd}
              placeholder="快速记录今日待办..."
              disabled={addPending}
              className="flex-1 bg-transparent font-hand text-[14px] text-ink placeholder:text-ink3 placeholder:italic outline-none"
            />
            {quickTitle && <span className="text-[10px] text-ink3 flex-shrink-0">↩ 添加</span>}
          </div>
        </div>

        {/* ── 右侧：时间轴 + 绝对定位时间块 ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            {/* 小时格网格 */}
            {HOURS.map((hour) => (
              <div key={hour} className="h-[52px] flex border-b border-line">
                <div className="w-12 flex-shrink-0 flex items-start justify-end pr-2 pt-1.5 font-num text-[11px] text-ink3 border-r border-line">
                  {hour}:00
                </div>
                <DroppableHourSlot
                  hour={hour}
                  date={currentDate}
                  isActive={activeHour === hour}
                  onOpen={() => setActiveHour(hour)}
                  onClose={() => setActiveHour(null)}
                  onAdd={() => { fetchTodos(); setActiveHour(null) }}
                />
              </div>
            ))}

            {/* 时间块绝对定位层 */}
            {(() => {
              const timed = todos.filter((t) => t.startTime)
              const layout = computeLayout(timed)
              return (
                <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: 48, right: 0 }}>
                  {timed.map((todo) => {
                    const { col, numCols } = layout.get(todo.id) ?? { col: 0, numCols: 1 }
                    return <TimeBlockItem key={todo.id} todo={todo} col={col} numCols={numCols} onUpdate={fetchTodos} />
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragData && (
          <div className="bg-white border border-accent/40 rounded-md px-2.5 py-1.5 text-[12px] font-body text-ink shadow-lg cursor-grabbing flex items-center gap-1 max-w-[200px]">
            {activeDragData.important && <span className="text-[10px]">🚩</span>}
            <span className="truncate">{activeDragData.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

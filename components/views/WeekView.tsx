'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  DndContext, DragOverlay, TouchSensor,
  useDroppable, useDraggable, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { SmartPointerSensor } from '@/lib/dnd'
import Sidebar from '@/components/layout/Sidebar'
import FAB from '@/components/todo/FAB'
import InlineAdd from '@/components/todo/InlineAdd'
import TodoItem from '@/components/todo/TodoItem'
import { setTodoTime } from '@/app/actions/todos'
import { useViewStore } from '@/store/viewStore'
import { isToday, isSameDay } from '@/lib/utils'
import type { Todo } from '@/types'

const WEEKDAYS_SHORT = ['日', '一', '二', '三', '四', '五', '六']
const HOURS = Array.from({ length: 17 }, (_, i) => i + 7)

function getWeekDays(date: Date): Date[] {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d); nd.setDate(d.getDate() + i); return nd
  })
}

// ── 顶部列表：可拖拽 Todo 条目 ────────────────────────
function DraggableTodoChip({ todo, onDelete }: { todo: Todo; onDelete: (id: string) => void }) {
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

// ── 时间格：可放置 + InlineAdd + Todo 色块 ────────────
function WeekDroppableSlot({
  di, hour, day, isSlotActive, todos, onOpen, onInlineDone, onInlineAdd,
}: {
  di: number; hour: number; day: Date; isSlotActive: boolean; todos: Todo[]
  onOpen: () => void; onInlineDone: () => void; onInlineAdd: (todo: Todo) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `week-slot-${di}-${hour}`,
    data: { di, hour },
  })
  return (
    <div
      ref={setNodeRef}
      onClick={() => !isSlotActive && onOpen()}
      className={`border-r last:border-r-0 border-b border-line min-h-12 relative cursor-pointer transition-colors group ${
        isOver ? 'bg-accent-bg/40' : isSlotActive ? 'bg-accent-bg/20' : 'hover:bg-paper2'
      }`}
    >
      {todos.map((todo) => (
        <div key={todo.id}
          className="mx-0.5 mt-0.5 bg-accent-bg border-l-2 border-accent rounded text-[9px] px-1 py-0.5 truncate text-ink flex items-center gap-0.5"
        >
          {todo.important && <span>🚩</span>}
          <span className="truncate">{todo.title}</span>
        </div>
      ))}
      {isSlotActive ? (
        <div className="p-1" onClick={(e) => e.stopPropagation()}>
          <InlineAdd
            date={day}
            startTime={new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0)}
            onDone={onInlineDone}
            onAdd={onInlineAdd}
          />
        </div>
      ) : (
        <>
          {isOver && <div className="absolute inset-0 border border-accent/40 pointer-events-none" />}
          {!isOver && todos.length === 0 && (
            <span className="absolute left-1 top-1 text-[9px] text-accent opacity-0 group-hover:opacity-50 transition-opacity">+</span>
          )}
        </>
      )}
    </div>
  )
}

// ── WeekView 主体 ─────────────────────────────────────
export default function WeekView() {
  const { currentDate } = useViewStore()
  const weekDays = getWeekDays(currentDate)
  const [todos, setTodos] = useState<Todo[]>([])
  const [activeDay, setActiveDay] = useState<Date | null>(null)
  const [activeSlot, setActiveSlot] = useState<{ di: number; hour: number } | null>(null)
  const [todoSectionOpen, setTodoSectionOpen] = useState(true)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)
  const [activeDragData, setActiveDragData] = useState<{ title: string; important: boolean } | null>(null)

  const sensors = useSensors(
    useSensor(SmartPointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const fetchTodos = useCallback(async () => {
    const start = weekDays[0]; const end = weekDays[6]
    const year = start.getFullYear(); const month = start.getMonth() + 1
    const res = await fetch(`/api/todos?year=${year}&month=${month}`)
    const data = await res.json()
    setTodos(
      (data.todos as Todo[]).map((t) => ({
        ...t,
        date: t.date ? new Date(t.date) : null,
        startTime: t.startTime ? new Date(t.startTime) : null,
        endTime: t.endTime ? new Date(t.endTime) : null,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })).filter((t) => {
        if (!t.date) return false
        const d = new Date(t.date)
        return d >= start && d <= end
      }),
    )
  }, [weekDays[0].toISOString()])

  useEffect(() => { fetchTodos(); setActiveDay(null); setActiveSlot(null) }, [fetchTodos])

  function todosForDay(day: Date) {
    return todos.filter((t) => t.date && isSameDay(new Date(t.date), day))
  }

  function todosAtSlot(di: number, hour: number) {
    const day = weekDays[di]
    return todos.filter((t) =>
      t.startTime && t.date &&
      isSameDay(new Date(t.date), day) &&
      new Date(t.startTime).getHours() === hour
    )
  }

  function handleDayAddClick(day: Date) {
    setActiveSlot(null)
    setActiveDay((prev) => (prev && isSameDay(prev, day) ? null : day))
  }

  function handleTimeSlotClick(di: number, hour: number) {
    setActiveDay(null)
    setActiveSlot((prev) => prev?.di === di && prev?.hour === hour ? null : { di, hour })
  }

  function handleDragStart(event: DragStartEvent) {
    const d = event.active.data.current as { title: string; important: boolean } | undefined
    setActiveDragData(d ?? { title: String(event.active.id), important: false })
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragData(null)
    const { active, over } = event
    if (!over) return
    const { di, hour } = over.data.current as { di: number; hour: number }
    const day = weekDays[di]
    const startTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0)
    await setTodoTime(active.id as string, day, startTime)
    fetchTodos()
    setSidebarRefreshKey((k) => k + 1)
  }

  const totalCount = todos.length
  const doneCount = todos.filter((t) => t.status === 'DONE').length
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar onTodosChange={fetchTodos} dragEnabled refreshTrigger={sidebarRefreshKey} />

        <div className="flex flex-col flex-1 overflow-hidden" style={{ paddingLeft: 16, paddingRight: 16 }}>
          {/* 统计条 */}
          <div className="flex border-b border-line flex-shrink-0">
            {[
              { label: '本周任务', value: String(totalCount), color: 'text-ink' },
              { label: '已完成', value: String(doneCount), color: 'text-accent' },
              { label: '完成率', value: totalCount > 0 ? `${pct}%` : '-%', color: 'text-warm' },
            ].map((s) => (
              <div key={s.label} className="flex-1 py-2.5 text-center border-r last:border-r-0 border-line">
                <div className={`font-num text-[22px] font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-ink3 font-body">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── 可折叠 Todo 区（支持拖拽） ── */}
          <div className="border-b border-line flex-shrink-0">
            <button
              onClick={() => setTodoSectionOpen(!todoSectionOpen)}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left hover:bg-paper2 transition-colors"
            >
              <span className="font-num text-[10px] text-ink3">{todoSectionOpen ? '▾' : '▸'}</span>
              <span className="text-[11px] text-ink3 font-body">本周待办</span>
              {totalCount > 0 && <span className="text-[11px] text-accent font-body">· {totalCount} 条</span>}
            </button>
            {todoSectionOpen && (
              <div className="grid overflow-x-auto" style={{ gridTemplateColumns: '44px repeat(7, 1fr)' }}>
                <div className="border-r border-line min-h-[52px]" />
                {weekDays.map((day, i) => {
                  const isActive = activeDay !== null && isSameDay(activeDay, day)
                  const dayTodos = todosForDay(day)
                  return (
                    <div key={i} className={`border-r last:border-r-0 border-line p-1 min-h-[52px] transition-colors ${isActive ? 'bg-accent-bg/40' : ''}`}>
                      {dayTodos.map((todo) => (
                        <DraggableTodoChip key={todo.id} todo={todo} onDelete={(id) => setTodos((prev) => prev.filter((t) => t.id !== id))} />
                      ))}
                      {isActive ? (
                        <InlineAdd date={day} onDone={() => setActiveDay(null)} onAdd={(newTodo) => { setTodos((prev) => [...prev, newTodo]); setActiveDay(null) }} />
                      ) : (
                        <button onClick={() => handleDayAddClick(day)}
                          className="text-[10px] text-ink3/50 hover:text-accent w-full text-left px-0.5 py-0.5 mt-0.5 transition-colors">
                          + 添加
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── 时间轴 ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid" style={{ gridTemplateColumns: '44px repeat(7, 1fr)', paddingBottom: 16 }}>
              {/* 表头 */}
              <div className="h-[56px] border-r border-b border-line" />
              {weekDays.map((day, i) => {
                const today = isToday(day); const isWeekend = i === 0 || i === 6
                const dayTodos = todosForDay(day)
                const doneCnt = dayTodos.filter((t) => t.status === 'DONE').length
                return (
                  <div key={i} className="h-[56px] border-r last:border-r-0 border-b border-line flex flex-col items-center justify-center gap-0.5">
                    <span className={`font-num text-[12px] ${isWeekend ? 'text-red' : 'text-ink2'}`}>{WEEKDAYS_SHORT[i]}</span>
                    <span className={`font-num text-[20px] leading-none ${
                      today ? 'bg-accent text-white rounded-full w-7 h-7 flex items-center justify-center text-[14px]' : isWeekend ? 'text-red' : 'text-ink'
                    }`}>{day.getDate()}</span>
                    {dayTodos.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-num ${
                        doneCnt === dayTodos.length ? 'bg-accent-bg text-accent' : 'bg-skip-bg text-ink3'
                      }`}>{doneCnt}/{dayTodos.length}</span>
                    )}
                  </div>
                )
              })}

              {/* 时间行 */}
              {HOURS.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="border-r border-b border-line min-h-12 flex items-start justify-end pr-1.5 pt-1 font-num text-[11px] text-ink3">
                    {hour}:00
                  </div>
                  {weekDays.map((day, di) => (
                    <WeekDroppableSlot
                      key={`slot-${hour}-${di}`}
                      di={di} hour={hour} day={day}
                      isSlotActive={activeSlot?.di === di && activeSlot?.hour === hour}
                      todos={todosAtSlot(di, hour)}
                      onOpen={() => handleTimeSlotClick(di, hour)}
                      onInlineDone={() => setActiveSlot(null)}
                      onInlineAdd={(newTodo) => { setTodos((prev) => [...prev, newTodo]); setActiveSlot(null) }}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragData && (
          <div className="bg-white border border-accent/40 rounded-md px-2.5 py-1.5 text-[12px] font-body text-ink shadow-lg cursor-grabbing flex items-center gap-1 max-w-[180px]">
            {activeDragData.important && <span className="text-[10px]">🚩</span>}
            <span className="truncate">{activeDragData.title}</span>
          </div>
        )}
      </DragOverlay>

      <FAB />
    </DndContext>
  )
}

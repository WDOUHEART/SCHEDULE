'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import type { TodoStatus } from '@/types'

async function requireUserId(): Promise<string> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session.userId
}

// ── 创建 Todo ──────────────────────────────────────────
export async function createTodo(data: {
  title: string
  date?: Date | null
  startTime?: Date | null
  important?: boolean
  note?: string
}) {
  const userId = await requireUserId()
  const todo = await prisma.todo.create({
    data: {
      title: data.title.trim(),
      date: data.date ?? null,
      startTime: data.startTime ?? null,
      important: data.important ?? false,
      note: data.note ?? null,
      status: 'PENDING',
      userId,
    },
  })
  revalidatePath('/')
  return todo
}

// ── 更新状态 ───────────────────────────────────────────
export async function updateTodoStatus(id: string, status: TodoStatus) {
  const userId = await requireUserId()
  await prisma.todo.updateMany({ where: { id, userId }, data: { status } })
  revalidatePath('/')
}

// ── 切换重要标记 ────────────────────────────────────────
export async function toggleTodoImportant(id: string) {
  const userId = await requireUserId()
  const todo = await prisma.todo.findFirst({ where: { id, userId }, select: { important: true } })
  if (!todo) return
  await prisma.todo.update({ where: { id }, data: { important: !todo.important } })
  revalidatePath('/')
}

// ── 更新标题 ───────────────────────────────────────────
export async function updateTodoTitle(id: string, title: string) {
  const userId = await requireUserId()
  await prisma.todo.updateMany({ where: { id, userId }, data: { title: title.trim() } })
  revalidatePath('/')
}

// ── 拖拽调整结束时间（日视图时间块拉伸）──────────────────
export async function setTodoEndTime(id: string, endTime: Date) {
  const userId = await requireUserId()
  await prisma.todo.updateMany({ where: { id, userId }, data: { endTime } })
  revalidatePath('/')
}

// ── 拖拽赋予具体时间（日/周视图时间格）──────────────────
export async function setTodoTime(id: string, date: Date, startTime: Date) {
  const userId = await requireUserId()
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  await prisma.todo.updateMany({ where: { id, userId }, data: { date: normalizedDate, startTime } })
  revalidatePath('/')
}

// ── 排期（拖拽赋予日期）────────────────────────────────
export async function scheduleTodo(id: string, date: Date) {
  const userId = await requireUserId()
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  await prisma.todo.updateMany({ where: { id, userId }, data: { date: normalized } })
  revalidatePath('/')
}

// ── 删除 Todo ──────────────────────────────────────────
export async function deleteTodo(id: string) {
  const userId = await requireUserId()
  await prisma.todo.deleteMany({ where: { id, userId } })
  revalidatePath('/')
}

// ── 读：按月查询 ────────────────────────────────────────
export async function getTodosByMonth(year: number, month: number) {
  const userId = await requireUserId()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return prisma.todo.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: [{ important: 'desc' }, { createdAt: 'asc' }],
  })
}

// ── 读：按天查询 ────────────────────────────────────────
export async function getTodosByDate(date: Date) {
  const userId = await requireUserId()
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  return prisma.todo.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: [{ important: 'desc' }, { createdAt: 'asc' }],
  })
}

// ── 读：无日期（待排期）────────────────────────────────
export async function getUnscheduledTodos() {
  const userId = await requireUserId()
  return prisma.todo.findMany({
    where: { userId, date: null, status: 'PENDING' },
    orderBy: [{ important: 'desc' }, { createdAt: 'asc' }],
  })
}

// ── 读：已归档（已完成 + 放过自己）────────────────────
export async function getArchivedTodos() {
  const userId = await requireUserId()
  return prisma.todo.findMany({
    where: { userId, status: { in: ['DONE', 'SKIPPED'] } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })
}

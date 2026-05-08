import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.userId

  const { searchParams } = req.nextUrl
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const date = searchParams.get('date')
  const unscheduled = searchParams.get('unscheduled')
  const archived = searchParams.get('archived')

  try {
    if (year && month) {
      const y = parseInt(year)
      const m = parseInt(month) - 1
      const start = new Date(y, m, 1)
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999)
      const todos = await prisma.todo.findMany({
        where: { userId, date: { gte: start, lte: end } },
        orderBy: [{ important: 'desc' }, { createdAt: 'asc' }],
      })
      return NextResponse.json({ todos })
    }

    if (date) {
      const d = new Date(date)
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
      const todos = await prisma.todo.findMany({
        where: { userId, date: { gte: start, lte: end } },
        orderBy: [{ important: 'desc' }, { createdAt: 'asc' }],
      })
      return NextResponse.json({ todos })
    }

    if (unscheduled === '1') {
      const todos = await prisma.todo.findMany({
        where: { userId, date: null, status: 'PENDING' },
        orderBy: [{ important: 'desc' }, { createdAt: 'asc' }],
      })
      return NextResponse.json({ todos })
    }

    if (archived === '1') {
      const todos = await prisma.todo.findMany({
        where: { userId, status: { in: ['DONE', 'SKIPPED'] } },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      })
      return NextResponse.json({ todos })
    }

    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json({ todos })
  } catch (err) {
    console.error('[GET /api/todos]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

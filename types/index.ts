export type TodoStatus = 'PENDING' | 'DONE' | 'SKIPPED' | 'OVERDUE'

export type ViewType = 'month' | 'week' | 'day'

export interface Todo {
  id: string
  userId?: string | null
  title: string
  note?: string | null
  status: TodoStatus
  important: boolean
  date?: Date | null
  startTime?: Date | null
  endTime?: Date | null
  deadline?: Date | null
  isRecurring: boolean
  recurRule?: string | null
  recurGroupId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  phone?: string | null
  wechatId?: string | null
  nickname: string
  avatar?: string | null
  createdAt: Date
}

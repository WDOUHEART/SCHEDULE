'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'

export type AuthState = { error?: string } | null

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const nickname = formData.get('nickname')?.toString().trim() ?? ''

  if (!email || !password || !nickname) return { error: '请填写所有字段' }
  if (password.length < 6) return { error: '密码至少 6 位' }
  if (nickname.length < 2) return { error: '昵称至少 2 个字' }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: '该邮箱已注册' }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { email, passwordHash, nickname } })

  await createSession({ userId: user.id, email: user.email, nickname: user.nickname })
  redirect('/month')
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!email || !password) return { error: '请填写邮箱和密码' }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: '邮箱或密码错误' }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { error: '邮箱或密码错误' }

  await createSession({ userId: user.id, email: user.email, nickname: user.nickname })
  redirect('/month')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

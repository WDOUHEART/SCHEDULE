import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'shiguang-session'
const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET!)

const PROTECTED = ['/month', '/week', '/day']
const AUTH_ONLY = ['/login', '/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  let isAuthed = false
  if (token) {
    try {
      await jwtVerify(token, encodedKey, { algorithms: ['HS256'] })
      isAuthed = true
    } catch {}
  }

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isAuthed) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && isAuthed) {
    return NextResponse.redirect(new URL('/month', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/month', '/week', '/day', '/login', '/register'],
}

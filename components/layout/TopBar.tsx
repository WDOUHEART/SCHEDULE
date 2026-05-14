'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useViewStore } from '@/store/viewStore'
import { logout } from '@/app/actions/auth'

const views = [
  { label: '月', href: '/month' },
  { label: '周', href: '/week' },
  { label: '日', href: '/day' },
] as const

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function TopBar({ nickname }: { nickname: string }) {
  const pathname = usePathname()
  const { currentDate, goToPrev, goToNext, goToToday } = useViewStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const enMonth = EN_MONTHS[month]
  const zhMonth = currentDate.toLocaleDateString('zh-CN', { month: 'long' })
  const periodLabel = currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric' })
  const avatarChar = nickname.slice(0, 1)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="flex items-end px-6 pt-4 border-b border-line bg-paper flex-shrink-0 gap-4">
      {/* 左：双语月份标题 */}
      <div className="flex-1 pb-3 min-w-0">
        <div className="font-num text-[40px] font-bold text-ink leading-[1] tracking-tight truncate">
          {enMonth}
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-hand text-[17px] text-ink2">{zhMonth}</span>
          <span className="text-[11px] text-ink3 font-body">{year} · 拾光</span>
        </div>
      </div>

      {/* 中：日期导航 + 视图切换 */}
      <div className="flex flex-col items-center pb-3 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrev}
            className="w-7 h-7 rounded-full border border-line text-ink2 font-num flex items-center justify-center hover:bg-paper2 hover:border-ink3 transition-all text-[15px]"
          >
            ‹
          </button>
          <button
            onClick={goToToday}
            className="font-num text-[13px] text-ink2 min-w-[88px] text-center hover:text-accent transition-colors"
          >
            {periodLabel}
          </button>
          <button
            onClick={goToNext}
            className="w-7 h-7 rounded-full border border-line text-ink2 font-num flex items-center justify-center hover:bg-paper2 hover:border-ink3 transition-all text-[15px]"
          >
            ›
          </button>
        </div>

        <nav className="flex gap-2">
          {views.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className={`px-5 py-1.5 text-[14px] font-num border-b-2 rounded-t transition-all min-w-[44px] text-center ${
                pathname === v.href
                  ? 'text-accent border-accent font-semibold'
                  : 'text-ink3 border-transparent hover:text-ink2 hover:border-line'
              }`}
            >
              {v.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* 右：Logo + 用户头像 */}
      <div className="flex items-end pb-3 gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="拾光日程" width={48} height={48} className="select-none flex-shrink-0 rounded-xl" />

        {/* 头像 + 下拉菜单 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-accent-bg text-accent flex items-center justify-center text-[15px] font-semibold font-hand border border-line hover:bg-accent hover:text-white transition-colors"
          >
            {avatarChar}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-50 bg-white border border-line rounded-xl shadow-lg py-1.5 min-w-[140px]">
              <div className="px-4 py-2 border-b border-line">
                <p className="text-[12px] font-body font-medium text-ink truncate">{nickname}</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 text-[12px] font-body text-ink3 hover:text-red hover:bg-red/5 transition-colors"
                >
                  退出登录
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

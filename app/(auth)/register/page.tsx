'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

function SunLogo() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
      <circle cx="21" cy="21" r="10" fill="#F5A623"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line key={i}
          x1={21 + 13 * Math.cos(deg * Math.PI / 180)}
          y1={21 + 13 * Math.sin(deg * Math.PI / 180)}
          x2={21 + 17 * Math.cos(deg * Math.PI / 180)}
          y2={21 + 17 * Math.sin(deg * Math.PI / 180)}
          stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round"
        />
      ))}
      <path d="M21 15 C24.3 15 27 17.7 27 21 C27 23.7 25.3 25.5 23 25.5 C21.2 25.5 20 24.2 20 22.5 C20 21.2 21 20.2 22.3 20.2"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

const fields = [
  { name: 'nickname', label: '昵称', type: 'text', placeholder: '怎么称呼你？', autoComplete: 'nickname',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="#5BB87A" strokeWidth="1.5"/><path d="M2 15.5C2 12.5 5 10 9 10C13 10 16 12.5 16 15.5" stroke="#5BB87A" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { name: 'email', label: '邮箱', type: 'email', placeholder: 'your@email.com', autoComplete: 'email',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="3.5" width="15" height="11" rx="2" stroke="#5BB87A" strokeWidth="1.5"/><path d="M1.5 6L9 10.5L16.5 6" stroke="#5BB87A" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { name: 'password', label: '密码', type: 'password', placeholder: '至少 6 位', autoComplete: 'new-password',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="8" width="12" height="8.5" rx="2" stroke="#5BB87A" strokeWidth="1.5"/><path d="M5.5 8V6a3.5 3.5 0 0 1 7 0v2" stroke="#5BB87A" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="12" r="1.2" fill="#5BB87A"/></svg> },
]

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, null)

  return (
    <div className="min-h-screen bg-[#F4F1EB] flex flex-col items-center justify-center relative overflow-hidden px-4 py-10">
      {/* 装饰圆 */}
      <div className="absolute -top-28 -left-28 w-[340px] h-[340px] rounded-full bg-[#C8E5D5] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-[280px] h-[280px] rounded-full bg-[#EDD9C0] opacity-55 pointer-events-none" />

      {/* 散点装饰 */}
      <div className="absolute top-[18%] right-[22%] w-3 h-3 rounded-full bg-[#F5A623] opacity-60 pointer-events-none" />
      <div className="absolute top-[32%] right-[12%] w-2 h-2 rounded-full bg-[#88BBDD] opacity-50 pointer-events-none" />
      <div className="absolute top-[55%] left-[18%] w-2.5 h-2.5 rounded-full bg-[#88BBDD] opacity-40 pointer-events-none" />
      <span className="absolute top-[22%] left-[20%] text-[#5BB87A] text-[20px] font-bold opacity-50 pointer-events-none select-none">+</span>
      <span className="absolute bottom-[35%] right-[20%] text-[#F5A623] text-[18px] font-bold opacity-50 pointer-events-none select-none">+</span>
      <span className="absolute top-[15%] left-[36%] text-[#5BB87A] text-[14px] opacity-35 pointer-events-none select-none">🍃</span>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-7 relative z-10">
        <SunLogo />
        <div>
          <div className="font-hand text-[32px] text-[#2C2C3A] leading-none tracking-wide">拾光日程</div>
          <div className="text-[11px] text-[#8A8A9A] font-body mt-0.5">有条理但不焦虑的手帐日程</div>
        </div>
      </div>

      {/* 注册卡片 */}
      <div className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl border border-[#E4EDE8] shadow-[0_6px_32px_rgba(0,0,0,0.09)]"
        style={{ padding: '32px 32px 28px' }}>
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-[#2C2C3A] font-body flex items-center gap-2">
            开启拾光之旅 <span>✨</span>
          </h1>
          <p className="text-[13px] text-[#9A9AAA] font-body mt-1">创建你的专属日程账号</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-[12px] font-medium text-[#5A5A6A] font-body mb-1.5 block">{f.label}</label>
              <div className="flex items-center gap-3 border border-[#C4DECE] rounded-lg"
                style={{ height: '32px', paddingLeft: '10px', paddingRight: '10px' }}>
                <span className="flex-shrink-0">{f.icon}</span>
                <input name={f.name} type={f.type} placeholder={f.placeholder} required autoComplete={f.autoComplete}
                  className="flex-1 bg-transparent text-[13px] font-body text-[#2C2C3A] placeholder:text-[#C0C0D0] outline-none"
                />
              </div>
            </div>
          ))}

          {state?.error && (
            <p className="text-[12px] text-red-500 font-body bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending}
            className="w-full bg-[#5BB87A] hover:bg-[#4DA86A] text-white rounded-lg text-[15px] font-body font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 mt-1 shadow-[0_6px_20px_rgba(91,184,122,0.50),0_2px_8px_rgba(91,184,122,0.30)]"
            style={{ height: '32px' }}
          >
            {pending ? '注册中...' : <>注册并开始 <span className="text-[18px] leading-none">→</span></>}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#9A9AAA] font-body mt-5">
          已有账号？{' '}
          <Link href="/login" className="text-[#5BB87A] font-medium hover:underline">直接登录</Link>
        </p>
      </div>
    </div>
  )
}

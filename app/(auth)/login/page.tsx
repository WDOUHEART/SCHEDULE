'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

function SunLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="10.5" fill="#F5A623"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line key={i}
          x1={22 + 13.5 * Math.cos(deg * Math.PI / 180)}
          y1={22 + 13.5 * Math.sin(deg * Math.PI / 180)}
          x2={22 + 18.5 * Math.cos(deg * Math.PI / 180)}
          y2={22 + 18.5 * Math.sin(deg * Math.PI / 180)}
          stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round"
        />
      ))}
      <path d="M22 16C25.3 16 28 18.7 28 22C28 24.6 26.3 26.3 24.2 26.3C22.5 26.3 21.2 25 21.2 23.4C21.2 22 22.1 21.1 23.4 21.1"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function CloudSVG({ w = 118, opacity = 0.72 }: { w?: number; opacity?: number }) {
  const h = Math.round(w * 0.55)
  return (
    <svg width={w} height={h} viewBox="0 0 118 65" fill="none">
      <circle cx="36" cy="43" r="23" fill="#9EC8E0" fillOpacity={opacity}/>
      <circle cx="60" cy="32" r="27" fill="#9EC8E0" fillOpacity={opacity}/>
      <circle cx="85" cy="43" r="20" fill="#9EC8E0" fillOpacity={opacity}/>
      <rect x="13" y="43" width="92" height="22" fill="#9EC8E0" fillOpacity={opacity}/>
    </svg>
  )
}

function CatPlant() {
  return (
    <svg width="210" height="172" viewBox="0 0 210 172" fill="none">
      {/* 盆栽 */}
      <path d="M22 110 L17 137 Q17 144 46 144 Q75 144 75 137 L70 110Z" fill="#E8A87A"/>
      <rect x="14" y="106" width="64" height="11" rx="5.5" fill="#D0906A"/>
      <path d="M46 106C46 88 32 71 26 53" stroke="#5BB87A" strokeWidth="3.3" strokeLinecap="round"/>
      <path d="M46 106C46 90 60 77 67 60" stroke="#5BB87A" strokeWidth="3.3" strokeLinecap="round"/>
      <path d="M46 106C44 93 44 79 46 67" stroke="#4AA870" strokeWidth="2.9" strokeLinecap="round"/>
      <ellipse cx="23" cy="51" rx="17" ry="10" fill="#7CC894" transform="rotate(-28 23 51)"/>
      <ellipse cx="69" cy="58" rx="17" ry="10" fill="#5BB87A" transform="rotate(28 69 58)"/>
      <ellipse cx="46" cy="64" rx="14" ry="9" fill="#7CC894"/>
      <ellipse cx="32" cy="73" rx="12" ry="7.5" fill="#9AD4A8" transform="rotate(-18 32 73)"/>
      <ellipse cx="61" cy="75" rx="12" ry="7.5" fill="#6DC48A" transform="rotate(18 61 75)"/>
      {/* 猫身 */}
      <ellipse cx="145" cy="139" rx="38" ry="25" fill="#EDEAE4"/>
      {/* 猫头 */}
      <circle cx="145" cy="101" r="29" fill="#EDEAE4"/>
      {/* 耳 */}
      <path d="M122 85 L113 63 L134 80Z" fill="#D8D0C8"/>
      <path d="M168 85 L177 63 L156 80Z" fill="#D8D0C8"/>
      <path d="M123 84 L116 66 L132 79Z" fill="#F4B0B8" fillOpacity="0.7"/>
      <path d="M167 84 L174 66 L158 79Z" fill="#F4B0B8" fillOpacity="0.7"/>
      {/* 眼 */}
      <ellipse cx="133" cy="98" rx="6.3" ry="6.8" fill="#45424F"/>
      <ellipse cx="157" cy="98" rx="6.3" ry="6.8" fill="#45424F"/>
      <circle cx="135" cy="96" r="2.5" fill="white"/>
      <circle cx="159" cy="96" r="2.5" fill="white"/>
      {/* 鼻嘴 */}
      <path d="M141 107 L145 110.5 L149 107Q145 104 141 107Z" fill="#F4A8B8"/>
      <path d="M140 111.5Q145 116 150 111.5" stroke="#999" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      {/* 胡须 */}
      <line x1="108" y1="104" x2="133" y2="107" stroke="#CCC" strokeWidth="1.2"/>
      <line x1="108" y1="109" x2="133" y2="110" stroke="#CCC" strokeWidth="1.2"/>
      <line x1="157" y1="107" x2="182" y2="104" stroke="#CCC" strokeWidth="1.2"/>
      <line x1="157" y1="110" x2="182" y2="109" stroke="#CCC" strokeWidth="1.2"/>
      {/* 项圈 + 铃铛 */}
      <path d="M118 118Q145 128 172 118" stroke="#5BB87A" strokeWidth="7" strokeLinecap="round"/>
      <circle cx="145" cy="127" r="5.5" fill="#F5C840"/>
      <line x1="142.5" y1="129.5" x2="147.5" y2="129.5" stroke="#C8A030" strokeWidth="1.4"/>
      {/* 爪 */}
      <ellipse cx="120" cy="158" rx="14" ry="9" fill="#E0DCD4"/>
      <ellipse cx="170" cy="158" rx="14" ry="9" fill="#E0DCD4"/>
      {/* 尾 */}
      <path d="M178 147C198 134 202 118 190 106" stroke="#D8D0C8" strokeWidth="15" strokeLinecap="round" fill="none"/>
      <path d="M178 147C198 134 202 118 190 106" stroke="#EDEAE4" strokeWidth="9" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

const features = [
  { icon: '🗓', color: '#D4EDE0', title: '轻松规划', desc: '每天更有条理' },
  { icon: '🤍', color: '#F5E4D8', title: '记录美好', desc: '珍藏每一刻' },
  { icon: '🙂', color: '#D8E8F4', title: '专注生活', desc: '不焦虑更从容' },
]

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)
  const [showPw, setShowPw] = useState(false)

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at -5% -5%, #AACFB8 0%, transparent 60%),
          radial-gradient(ellipse 65% 55% at 108% 108%, #E8C88A 0%, transparent 58%),
          #F2EFE8
        `,
      }}
    >
      {/* 云朵1 — 右上 */}
      <div className="absolute top-6 right-6 pointer-events-none">
        <CloudSVG w={130} opacity={0.80}/>
      </div>
      {/* 云朵2 — 右中 */}
      <div className="absolute top-[26%] right-[3%] pointer-events-none">
        <CloudSVG w={76} opacity={0.55}/>
      </div>

      {/* 十字1 — 左中 */}
      <div className="absolute top-[22%] left-[12%] text-[#5BB87A] text-[30px] font-bold leading-none opacity-45 pointer-events-none select-none">+</div>
      {/* 十字2 — 右下 */}
      <div className="absolute bottom-[33%] right-[15%] text-[#E8A040] text-[26px] font-bold leading-none opacity-50 pointer-events-none select-none">+</div>

      {/* 黄色小圆点 */}
      <div className="absolute top-[13%] right-[25%] w-4 h-4 rounded-full bg-[#F5C040] opacity-75 pointer-events-none"/>

      {/* 淡绿叶子 */}
      <div className="absolute top-[9%] left-[36%] text-[18px] opacity-38 pointer-events-none select-none rotate-[-15deg]">🍃</div>

      {/* 猫咪 — 左下 */}
      <div className="absolute bottom-0 left-0 pointer-events-none">
        <CatPlant/>
      </div>

      {/* ══ 主内容 ══ */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-5 py-10 flex flex-col items-center gap-5">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <SunLogo/>
          <div>
            <div className="font-hand text-[32px] text-[#2A2A38] leading-none tracking-wider">拾光日程</div>
            <div className="text-[11px] text-[#9A9AAC] font-body mt-0.5">有条理但不焦虑的手帐日程</div>
          </div>
        </div>

        {/* 卡片 */}
        <div className="w-full bg-white rounded-lg border border-[#E4EDE8] shadow-[0_6px_32px_rgba(0,0,0,0.09)]"
          style={{ padding: '32px 32px 28px' }}>

          <div className="mb-7">
            <h1 className="text-[20px] font-bold text-[#2A2A38] font-body flex items-center gap-2">
              欢迎回来 <span>🌿</span>
            </h1>
            <p className="text-[12px] text-[#9A9AAC] font-body mt-1.5">登录你的拾光日程账号</p>
          </div>

          <form action={action} className="flex flex-col gap-5">

            {/* 邮箱 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#5A5A6A] font-body">邮箱</label>
              <div className="flex items-center gap-3 border border-[#C4DECE] rounded-lg"
                style={{ height: '32px', paddingLeft: '10px', paddingRight: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="#5BB87A" strokeWidth="1.6"/>
                  <path d="M2 7.5L10 12L18 7.5" stroke="#5BB87A" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                <input name="email" type="email" placeholder="your@email.com" required autoComplete="email"
                  className="flex-1 bg-transparent text-[13px] font-body text-[#2A2A38] placeholder:text-[#C0C0D0] outline-none min-w-0"/>
              </div>
            </div>

            {/* 密码 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#5A5A6A] font-body">密码</label>
              <div className="flex items-center gap-3 border border-[#C4DECE] rounded-lg"
                style={{ height: '32px', paddingLeft: '10px', paddingRight: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <rect x="3" y="9" width="14" height="9.5" rx="2.5" stroke="#5BB87A" strokeWidth="1.6"/>
                  <path d="M6 9V7a4 4 0 0 1 8 0v2" stroke="#5BB87A" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="10" cy="13.5" r="1.4" fill="#5BB87A"/>
                </svg>
                <input name="password" type={showPw ? 'text' : 'password'} placeholder="输入密码" required autoComplete="current-password"
                  className="flex-1 bg-transparent text-[13px] font-body text-[#2A2A38] placeholder:text-[#C0C0D0] outline-none min-w-0"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="text-[#C0C0D0] hover:text-[#5BB87A] transition-colors flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M1.5 10C3.3 6.2 6.4 4 10 4s6.7 2.2 8.5 6c-1.8 3.8-4.9 6-8.5 6s-6.7-2.2-8.5-6Z"
                      stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="10" cy="10" r="2.8" stroke="currentColor" strokeWidth="1.5"/>
                    {showPw && <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
                  </svg>
                </button>
              </div>
            </div>

            {/* 记住我 + 忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="w-[18px] h-[18px] rounded-[5px] bg-[#5BB87A] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-[12px] text-[#6A6A7A] font-body">记住我</span>
              </label>
              <span className="text-[12px] text-[#5BB87A] font-body cursor-default">忘记密码？</span>
            </div>

            {state?.error && (
              <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3 font-body">
                {state.error}
              </p>
            )}

            {/* 登录按钮 */}
            <button type="submit" disabled={pending}
              className="w-full bg-[#5BB87A] hover:bg-[#4DA86C] text-white rounded-lg text-[15px] font-body font-semibold
                flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-60
                shadow-[0_6px_20px_rgba(91,184,122,0.50),0_2px_8px_rgba(91,184,122,0.30)]"
              style={{ height: '32px' }}>
              {pending ? '登录中...' : <><span>登录</span><span className="text-[20px] leading-none">→</span></>}
            </button>
          </form>

          <p className="text-center text-[12px] text-[#9A9AAC] font-body mt-5 flex items-center justify-center gap-1">
            还没有账号？
            <Link href="/register" className="text-[#5BB87A] font-semibold hover:underline">
              立即注册
            </Link>
          </p>

        </div>{/* /卡片 */}

        {/* 底部特性 — 与卡片同宽，px-4 对齐卡片内边距 */}
        <div className="w-full flex items-center justify-between px-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center text-[20px] flex-shrink-0"
                style={{ backgroundColor: f.color }}>
                {f.icon}
              </div>
              <div>
                <div className="text-[12px] font-body font-semibold text-[#3A3A4A]">{f.title}</div>
                <div className="text-[10px] font-body text-[#9A9AAC] leading-tight">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

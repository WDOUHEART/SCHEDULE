import TopBar from '@/components/layout/TopBar'
import { getSession } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const nickname = session?.nickname ?? '我'

  return (
    <div className="flex flex-col w-full h-screen bg-paper overflow-hidden">
      <TopBar nickname={nickname} />
      <div className="flex flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  )
}

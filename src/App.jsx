import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { cn } from './lib/utils.js'
import CandidateWall from './pages/CandidateWall.jsx'
import CandidateDetail from './pages/CandidateDetail.jsx'
import AddCandidate from './pages/AddCandidate.jsx'

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={cn(
        'rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
        active ? 'bg-sage-600 text-white' : 'text-stone-600 hover:bg-oat-200 hover:text-stone-900'
      )}
    >
      {children}
    </Link>
  )
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-oat-300 bg-oat-100/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-xl font-bold tracking-tight text-stone-900">
              IP Scout
            </span>
            <span className="hidden text-xs text-stone-400 sm:inline">
              插畫師 IP 授權候選資料庫
            </span>
          </Link>
          <nav className="flex items-center gap-1.5">
            <NavLink to="/" active={pathname === '/'}>
              候選牆
            </NavLink>
            <NavLink to="/add" active={pathname === '/add'}>
              ＋ 加入候選
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<CandidateWall />} />
          <Route path="/candidate/:id" element={<CandidateDetail />} />
          <Route path="/add" element={<AddCandidate />} />
        </Routes>
      </main>
    </div>
  )
}

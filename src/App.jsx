import { Routes, Route, Link, useLocation } from 'react-router-dom'
import CandidateWall from './pages/CandidateWall.jsx'
import CandidateDetail from './pages/CandidateDetail.jsx'
import AddCandidate from './pages/AddCandidate.jsx'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">IP Scout</span>
            <span className="hidden text-xs text-neutral-400 sm:inline">
              插畫師 IP 授權候選資料庫
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname === '/'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              候選牆
            </Link>
            <Link
              to="/add"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname === '/add'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              ＋ 加入候選
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<CandidateWall />} />
          <Route path="/candidate/:id" element={<CandidateDetail />} />
          <Route path="/add" element={<AddCandidate />} />
        </Routes>
      </main>
    </div>
  )
}

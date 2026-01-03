// src/layouts/AppLayout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Dock from '../components/Dock'
import { Home, NotebookPen, Music, Calendar, Unlink } from 'lucide-react'

// Define the pages with all required properties for the Page type expected by Dock.
// Assuming Page type requires id, name, icon, and we've added path for navigation.
const defaultPages = [
  { id: 'home', name: 'Home', icon: Home, path: '/' },
  { id: 'poem', name: 'Poems', icon: NotebookPen, path: '/poem' },
  { id: 'playlist', name: 'Playlist', icon: Music, path: '/playlist' },
  { id: 'affirmations', name: 'Affirmations', icon: Calendar, path: '/affirmations' },
  { id: 'goodbye', name: 'Goodbye', icon: Unlink, path: '/goodbye' }
];

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black relative">
      <Outlet />

      <Dock
        pages={defaultPages}
        activePage={location.pathname}
        onPageChange={(path: string) => navigate(path)} // Type onPageChange to match navigate's expected input
      />
    </div>
  )
}
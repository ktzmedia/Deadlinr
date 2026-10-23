import { useHashRoute } from './lib'
import Landing from './components/Landing'
import Tracker from './components/Tracker'
import SharedView from './components/SharedView'

export default function App() {
  const hash = useHashRoute()
  if (hash.startsWith('#/s/')) return <SharedView payload={hash.slice(4)} />
  return hash.startsWith('#/app') ? <Tracker /> : <Landing />
}

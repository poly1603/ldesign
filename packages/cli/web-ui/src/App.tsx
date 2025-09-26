import { Routes, Route } from 'react-router-dom'
import { SocketProvider } from './contexts/SocketContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { TaskStateProvider } from './contexts/TaskStateContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Files from './pages/Files'
import Config from './pages/Config'
import Templates from './pages/Templates'
import Dependencies from './pages/Dependencies'
import Plugins from './pages/Plugins'
import Analytics from './pages/Analytics'
import DevPage from './pages/DevPage'
import BuildPage from './pages/BuildPage'
import PreviewPage from './pages/PreviewPage'

function App() {
  return (
    <SocketProvider>
      <ProjectProvider>
        <TaskStateProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dev" element={<DevPage />} />
              <Route path="/build" element={<BuildPage />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/files" element={<Files />} />
              <Route path="/config" element={<Config />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/dependencies" element={<Dependencies />} />
              <Route path="/plugins" element={<Plugins />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Layout>
        </TaskStateProvider>
      </ProjectProvider>
    </SocketProvider>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './features/layout'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
// import CatalogPage from './pages/CatalogPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          {/* <Route path="/catalog" element={<CatalogPage />} /> */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App


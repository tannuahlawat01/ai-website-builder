import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { setAuthToken, getUserProfile } from './lib/api'

// Test Dashboard that calls the backend
const DashboardPage = () => {
  const { getToken } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken()
        setAuthToken(token)
        const response = await getUserProfile()
        setUser(response.data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) return <div style={{color:'white',padding:'40px',background:'#09090b',minHeight:'100vh'}}>Loading...</div>

  return (
    <div style={{color:'white',padding:'40px',background:'#09090b',minHeight:'100vh'}}>
      <h1>📊 Dashboard</h1>
      {user && (
        <div style={{marginTop:'20px',padding:'20px',background:'#18181b',borderRadius:'8px'}}>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name || 'Not set'}</p>
          <p><strong>Credits:</strong> {user.credits}</p>
          <p><strong>Plan:</strong> {user.plan}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
      )}
    </div>
  )
}

const LandingPage = () => <div style={{color:'white',padding:'40px',background:'#09090b',minHeight:'100vh'}}><h1>🏠 Landing Page</h1></div>

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <div style={{color:'white',padding:'40px',background:'#09090b',minHeight:'100vh'}}>Loading...</div>
  if (!isSignedIn) return <Navigate to="/sign-in" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" afterSignUpUrl="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Navigation from './components/Navigation';
import Login from "./pages/Login"
import MyTerms from "./pages/MyTerms"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"

function Logout(){
  localStorage.clear()
  return <Navigate to="/login"/>
}

function RegisterAndLogout(){
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Navigation /> 
      <Routes>
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>}
        />
        <Route 
          path="/my-terms" 
          element={
            <ProtectedRoute>
              <MyTerms/>
            </ProtectedRoute>}
        />
        <Route path="/login" element={<Login/>}/>
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/register" element={<RegisterAndLogout/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
      
    </BrowserRouter>
  )
}

export default App

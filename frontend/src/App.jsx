import React from "react"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { UserProvider } from './context/UserContext'; 


import Navigation from './components/Navigation';
import Login from "./pages/Login"
import MyTerms from "./pages/MyTerms"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ChangePassword from "./pages/ChangePassword";
import GroupProtectedRoute from "./components/GroupProtectedRoute"
import PlayerForm from "./components/PlayerForm";
import TeamForm from "./components/TeamForm";


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
      <UserProvider>
          <Navigation /> 
        <Routes>
          
          <Route 
            path="/" 
            element={
              <GroupProtectedRoute requiredGroups={['admin', 'user', 'staff','player']}>
                  <Home/>
              </GroupProtectedRoute>}
          />
          <Route 
            path="/my-terms" 
            element={
              <GroupProtectedRoute requiredGroups={['admin', 'staff','player']}>
                  <MyTerms/>
                </GroupProtectedRoute>}
          />
          <Route 
            path="/players" 
            element={
              <GroupProtectedRoute requiredGroups={['admin', 'staff']}>
                <PlayerForm/>
              </GroupProtectedRoute>}
          />
          <Route 
            path="/player-team" 
            element={
              <GroupProtectedRoute requiredGroups={['admin', 'staff']}>
                <TeamForm/>
              </GroupProtectedRoute>}
          />

          <Route 
            path="/change-password" 
            element={
              <GroupProtectedRoute requiredGroups={['admin', 'staff']}>
                <ChangePassword/>
              </GroupProtectedRoute>
              }
            />

          <Route path="/login" element={<Login/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/register" element={<RegisterAndLogout/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
        </UserProvider>
      </BrowserRouter>
   
  )
}

export default App

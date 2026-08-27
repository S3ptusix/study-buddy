import { Route, Routes } from "react-router-dom"
import Landing from "./pages/Landing"
import Register from "./pages/Register"
import Login from "./pages/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import GuestRoute from "./components/GuestRoute"

function App() {


  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App

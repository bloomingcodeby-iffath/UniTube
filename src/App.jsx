import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";

// Protected Route
function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const [dark, setDark] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home dark={dark} setDark={setDark} />} />
        <Route path="/about" element={<About dark={dark} setDark={setDark} />} />
        <Route path="/login" element={<Login dark={dark} setDark={setDark} />} />
        <Route path="/register" element={<Register dark={dark} setDark={setDark} />} />
        <Route path="/courses" element={
          <Protected><Courses dark={dark} setDark={setDark} /></Protected>
        } />
        <Route path="/dashboard" element={
          <Protected><Dashboard dark={dark} setDark={setDark} /></Protected>
        } />
      </Routes>
    </BrowserRouter>
  );
}
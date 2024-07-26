import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm/LoginForm";
import RegisterForm from "./components/RegisterForm/RegisterForm";
import Dashboard from "./components/Dashboard/Dashboard";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import AddCustomer from "./components/AddCustomer/AddCustomer";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchCustomer from "./components/SearchCustomer/SearchCustomer";
import ManageUsers from "./components/AdminPanel/ManageUsers";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginForm />} />{" "}
          <Route path="/login" element={<LoginForm />}></Route>
          <Route path="/register" element={<RegisterForm />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route
            path="/yeni-musteri"
            element={
              <ProtectedRoute>
                <AddCustomer />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/musteri-ara"
          element={
            <ProtectedRoute>
              <SearchCustomer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kullanicilar"
          element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

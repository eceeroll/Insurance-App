import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm/LoginForm";
import RegisterForm from "./components/RegisterForm/RegisterForm";
import Dashboard from "./components/Dashboard/Dashboard";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import AddCustomer from "./components/AddCustomer/AddCustomer";

// giriş yapmayan kişi dashboard a giremesin
// çıkış yap butonu ekle 
// müşteri ekle -> backend
// staj defteri


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* <Route path="/"  element={LoginForm}></Route> */}
          <Route index element={<LoginForm />}></Route>
          <Route path="/login" element={<LoginForm />}></Route>
          <Route path="/register" element={<RegisterForm />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/admin" element={<AdminPanel />}></Route>
          <Route path="/forgotPassword" element={<ForgotPassword />}></Route>
          <Route path="/yeni-musteri" element={<AddCustomer />}></Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

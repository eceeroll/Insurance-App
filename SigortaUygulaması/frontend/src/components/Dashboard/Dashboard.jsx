import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ firstName: "", lastName: "" });

  useEffect(() => {
    const firstName =
      location.state?.firstName || localStorage.getItem("firstName");
    const lastName =
      location.state?.lastName || localStorage.getItem("lastName");

    if (firstName && lastName) {
      setUser({
        firstName,
        lastName,
      });
    }
  }, [location]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    if (window.confirm("Emin misiniz?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      navigate("/login");
    }
  };

  return (
    <div className={styles.dashboard}>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Çıkış Yap
      </button>
      <div className={styles.welcome}>
        {user.firstName} {user.lastName} olarak giriş yaptınız
      </div>
      <div className={styles.menu}>
        <button onClick={() => handleNavigation("/yeni-musteri")}>
          Yeni Müşteri
        </button>
        <button onClick={() => handleNavigation("/musteri-ara")}>
          Müşteri Ara
        </button>
        <button onClick={() => handleNavigation("/yeni-polica")}>
          Yeni Poliçe
        </button>
        <button onClick={() => handleNavigation("/polica-ara")}>
          Poliçe Ara
        </button>
      </div>
      <h1 className={styles.welcomeMessage}>
        Hoşgeldiniz {user.firstName} {user.lastName}
      </h1>
    </div>
  );
}

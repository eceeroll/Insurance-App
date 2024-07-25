import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { firstName, lastName } = location.state || {};

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    if (window.confirm("Emin misiniz?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className={styles.dashboard}>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Çıkış Yap
      </button>
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
      <h1>
        Hoşgeldiniz {firstName} {lastName}
      </h1>
    </div>
  );
}

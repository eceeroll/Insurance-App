import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdminPanel.module.css";

export default function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { firstName, lastName } = location.state;
  const [allCustomers, setAllCustomers] = useState([]);

  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/admin/customers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAllCustomers(response.data);
      } catch (error) {
        console.error("Error while fetching customers:", error);
      }
    };

    fetchAllCustomers();
  }, []);

  return (
    <div className={styles.adminPanel}>
      <header className={styles.header}>
        <div className={styles.welcome}>
          {firstName} {lastName} (admin) olarak giriş yaptınız
        </div>
        <h1 className={styles.title}>Admin Paneli</h1>
        <button
          className={styles.logoutButton}
          onClick={() => navigate("/login")}
        >
          Çıkış Yap
        </button>
      </header>

      <div className={styles.buttonContainer}>
        <button
          onClick={() => navigate("/kullanicilar")}
          className={styles.button}
        >
          Kullanıcıları Yönet
        </button>
        <button className={styles.button}>Teklifleri Yönet</button>
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Son Poliçeler</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Poliçe Detayı</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>{/* Tablo verileri buraya gelecek */}</tbody>
          </table>
        </div>
        <div className={styles.section}>
          <h2>Son Müşteriler</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>İsim</th>
                <th>Soyisim</th>
                <th>Tarih</th>
                <th>Oluşturan Kullanıcı</th>
              </tr>
            </thead>
            <tbody>
              {allCustomers.map((customer, index) => (
                <tr key={customer._id}>
                  <td>{index + 1}</td>
                  <td>{customer.first_name}</td>
                  <td>{customer.last_name}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>{customer.addedBy.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

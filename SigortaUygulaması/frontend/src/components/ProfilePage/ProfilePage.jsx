import styles from "./ProfilePage.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [userInfo, setUserInfo] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const response = await axios.get(
        `http://localhost:5000/api/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserInfo(response.data);
    };

    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const response = await axios.put(
      `http://localhost:5000/api/users/${user.id}`,
      userInfo,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      setSuccessMessage("Kullanıcı Bilgileri Başarıyla Güncellendi! ");
      setIsEditing(false);
    }

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);

    setUserInfo({});
  };

  return (
    <div className={styles.profileContainer}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        Geri
      </button>
      <div className={styles.header}>
        <h1>Profil Bilgileri</h1>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}
      <div className={styles.profileDetails}>
        <label>Ad:</label>

        {isEditing ? (
          <input
            type="text"
            name="firstName"
            value={userInfo.firstName}
            onChange={handleChange}
          />
        ) : (
          <p>{userInfo.firstName}</p>
        )}

        <label>Soyad:</label>
        {isEditing ? (
          <input
            type="text"
            name="lastName"
            value={userInfo.lastName}
            onChange={handleChange}
          />
        ) : (
          <p>{userInfo.lastName}</p>
        )}

        <label>E-posta:</label>
        {isEditing ? (
          <input
            type="text"
            name="email"
            value={userInfo.email}
            onChange={handleChange}
          />
        ) : (
          <p>{userInfo.email}</p>
        )}
      </div>

      {isEditing ? (
        <div className={styles.buttonGroup}>
          <button onClick={handleSave} className={styles.saveButton}>
            Kaydet
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={styles.cancelButton}
          >
            İptal
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={styles.editButton}
        >
          Düzenle
        </button>
      )}
    </div>
  );
}

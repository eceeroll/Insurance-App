import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaInfoCircle, FaUser } from "react-icons/fa";
import DetailsModal from "../DetailsModal/DetailsModal";
import axios from "axios";
import styles from "./AdminPanel.module.css";
import { getProductTypeByBranchCode } from "../../utils/getProductTypeByBranchCode";
import Logo from "../Logo";

export default function AdminPanel() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [allCustomers, setAllCustomers] = useState([]);
  const [allPolicies, setAllPolicies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
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

    const fetchAllPolicies = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/admin/policies",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sortedPolicies = response.data.sort(
          (a, b) => new Date(b.tanzimTarihi) - new Date(a.tanzimTarihi)
        );

        setAllPolicies(sortedPolicies);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllCustomers();
    fetchAllPolicies();
  }, [token]);

  const convertStatusCodeToText = (statusCode) => {
    if (statusCode === "T") {
      return "Teklif";
    } else if (statusCode === "K") return "Kayıt";
  };

  const handleInfoClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleLogout = () => {
    if (window.confirm("Emin misiniz?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      navigate("/login");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // seçilen iteme göre modal render
  const renderModalContent = () => {
    if (!selectedItem) return null;

    if (selectedItem.policeNo) {
      // Poliçe detayları
      return (
        <div>
          <h3>Poliçe Detayları</h3>
          <p>
            <strong>Poliçe No:</strong> {selectedItem.policeNo}
          </p>
          <p>
            <strong>Poliçe Türü:</strong>{" "}
            {getProductTypeByBranchCode(selectedItem.bransKodu)}
          </p>
          <p>
            <strong>Oluşturan Kullanıcı:</strong>{" "}
            {selectedItem.onaylayan.username}
          </p>
          <p>
            <strong>Başlangıç Tarihi:</strong>{" "}
            {new Date(selectedItem.baslangicTarihi).toLocaleDateString()}
          </p>
          <p>
            <strong>Tanzim Tarihi:</strong>{" "}
            {new Date(selectedItem.tanzimTarihi).toLocaleDateString()}
          </p>
          <p>
            <strong>Bitiş Tarihi:</strong>{" "}
            {new Date(selectedItem.bitisTarihi).toLocaleDateString()}
          </p>
          <p>
            <strong>Müşteri No:</strong>{" "}
            {selectedItem.musteriBilgileri.musteriNumarasi}
          </p>
          <p>
            <strong>Müşteri Adı Soyadı:</strong>{" "}
            {selectedItem.musteriBilgileri.musteriAd}{" "}
            {selectedItem.musteriBilgileri.musteriSoyad}
          </p>
        </div>
      );
    } else {
      // Müşteri detayları
      return (
        <div>
          <h3>Müşteri Detayları</h3>
          <p>
            <strong>Müşteri Numarası:</strong> {selectedItem.musteri_no}
          </p>
          <p>
            <strong>TC:</strong> {selectedItem.tc_no}
          </p>
          <p>
            <strong>İsim:</strong> {selectedItem.first_name}
          </p>
          <p>
            <strong>Soyisim:</strong> {selectedItem.last_name}
          </p>
          <p>
            <strong>İl:</strong> {selectedItem.province}
          </p>
          <p>
            <strong>İlçe:</strong>{" "}
            {selectedItem.district.charAt(0).toUpperCase() +
              selectedItem.district.slice(1).toLowerCase()}
          </p>
          <p>
            <strong>Doğum Tarihi:</strong>{" "}
            {new Date(selectedItem.date_of_birth).toLocaleDateString()}
          </p>
          <p>
            <strong>Email:</strong> {selectedItem.email}
          </p>
          <p>
            <strong>Telefon Numarası:</strong> {selectedItem.phone_number}
          </p>
          <p>
            <strong>Oluşturan Kullanıcı:</strong>{" "}
            {selectedItem.addedBy.username}
          </p>
        </div>
      );
    }
  };

  return (
    <div className={styles.adminPanel}>
      <Logo />
      <h1 style={{ fontSize: "2rem" }}>Admin Paneli</h1>
      <div className={styles.profileMenu}>
        <div className={styles.profileInfo} onClick={toggleMenu}>
          <FaUser className={styles.profileIcon} size={20} />
          {currentUser.firstName} {currentUser.lastName}
        </div>
        <div
          className={
            isMenuOpen
              ? `${styles.dropdownMenu} ${styles.active}`
              : styles.dropdownMenu
          }
        >
          <Link to="/profile">Profilim</Link>
          <Link to="/sifre-yenile">Şifre Yenile</Link>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={() => navigate("/kullanicilar")}
          className={styles.button}
        >
          Kullanıcıları Yönet
        </button>
        <button
          onClick={() => navigate("/policeler")}
          className={styles.button}
        >
          Teklifleri Yönet
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Son Poliçeler</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Poliçe Türü</th>
                <th>Poliçe No</th>
                <th>Tarih</th>
                <th>Oluşturan</th>
                <th>Durum</th>
                <th>Detaylar</th>
              </tr>
            </thead>
            <tbody>
              {allPolicies.map((policy) => (
                <tr key={policy._id}>
                  <td>{getProductTypeByBranchCode(policy.bransKodu)}</td>
                  <td>{policy.policeNo}</td>
                  <td>{new Date(policy.tanzimTarihi).toLocaleDateString()}</td>
                  <td>{policy.onaylayan.username}</td>
                  <td>{convertStatusCodeToText(policy.status)}</td>
                  <td style={{ textAlign: "center" }}>
                    <FaInfoCircle
                      onClick={() => handleInfoClick(policy)}
                      style={{ cursor: "pointer" }}
                      size={20}
                      color="#007bff"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.section}>
          <h2>Son Müşteriler</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Müşteri No</th>
                <th>İsim</th>
                <th>Soyisim</th>
                <th>Tarih</th>
                <th>Oluşturan</th>
                <th>Detaylar</th>
              </tr>
            </thead>
            <tbody>
              {allCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.musteri_no}</td>
                  <td>{customer.first_name}</td>
                  <td>{customer.last_name}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>{customer.addedBy.username}</td>
                  <td style={{ textAlign: "center" }}>
                    <FaInfoCircle
                      onClick={() => handleInfoClick(customer)}
                      style={{ cursor: "pointer" }}
                      size={20}
                      color="#007bff"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        content={renderModalContent()}
      />
    </div>
  );
}

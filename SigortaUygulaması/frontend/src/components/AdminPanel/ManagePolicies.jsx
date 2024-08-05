/* eslint-disable react-hooks/exhaustive-deps */
import styles from "./ManagePolicies.module.css";
import DetailsModal from "../DetailsModal/DetailsModal";
import { useState, useEffect } from "react";
import axios from "axios";
import { getProductTypeByBranchCode } from "../../utils/getProductTypeByBranchCode";

export default function ManagePolicies() {
  const token = localStorage.getItem("token");
  const [allPolicies, setAllPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [isDetailsClicked, setIsDetailsClicked] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [detailsContent, setDetailsContent] = useState(null);
  const [carDetails, setCarDetails] = useState(null);

  // sayfa açıldığında poliçeleri çek
  useEffect(() => {
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

        setAllPolicies(response.data);
        setFilteredPolicies(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllPolicies();
  }, [token]);

  //   filtreleme, sıralama veya arama işlemi yapıldığında
  useEffect(() => {
    let policies = [...allPolicies];
    if (searchTerm) {
      policies = policies.filter((policy) =>
        policy.policeNo.startsWith(searchTerm)
      );
    }
    if (filter) {
      policies = policies.filter((policy) =>
        filter === "Teklif" ? policy.status === "T" : policy.status === "K"
      );
    }
    if (sortOrder === "asc") {
      policies.sort(
        (a, b) => new Date(a.baslangicTarihi) - new Date(b.baslangicTarihi)
      );
    } else {
      policies.sort(
        (a, b) => new Date(b.baslangicTarihi) - new Date(a.baslangicTarihi)
      );
    }
    setFilteredPolicies(policies);
  }, [searchTerm, filter, sortOrder, allPolicies]);

  // selectedPolicy seçildiğinde modal content güncelle
  useEffect(() => {
    if (selectedPolicy) {
      const content = renderModalContent();
      setDetailsContent(content);
    }
  }, [selectedPolicy]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleDeletePolicy = async (id) => {
    try {
      const confirmDelete = window.confirm(
        `${id} ID'li Poliçe Silinecektir. Devam etmek istiyor musunuz?`
      );

      if (!confirmDelete) {
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/admin/policies/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Poliçe Silindi");
        setFilteredPolicies(
          filteredPolicies.filter((policy) => policy._id !== id)
        );
      } else {
        alert("Bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting policy:", error);
      alert("Bir hata oluştu");
    }
  };

  // Detaylar Butonuna tıklandığında tetikle
  const handleShowDetails = async (policy) => {
    setIsDetailsClicked(true);
    setSelectedPolicy(policy);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/policy/policeler/${policy._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Yanıtı:", response.data);

      const { policy: detailedPolicy, carDetails } = response.data;

      setSelectedPolicy(detailedPolicy);
      setCarDetails(carDetails);
    } catch (error) {
      console.error("Sunucu Hatası:", error);
    }
  };

  const handleDetailsModalClose = () => {
    setIsDetailsClicked(false);
    setSelectedPolicy(null);
  };

  // modal içeriği
  const renderModalContent = () => {
    if (selectedPolicy) {
      return (
        <div>
          <h3>Poliçe Detayları</h3>
          <div className={styles.policyDetailsContainer}>
            <div className={styles.policyDetails}>
              <h4>Poliçe Bilgileri</h4>
              <p>
                <strong>Poliçe No:</strong> {selectedPolicy.policeNo}
              </p>
              <p>
                <strong>Poliçe Türü:</strong>{" "}
                {getProductTypeByBranchCode(selectedPolicy.bransKodu)}
              </p>
              <p>
                <strong>Oluşturan Kullanıcı:</strong>{" "}
                {selectedPolicy.onaylayan.username}
              </p>
              <p>
                <strong>Başlangıç Tarihi:</strong>{" "}
                {new Date(selectedPolicy.baslangicTarihi).toLocaleDateString()}
              </p>
              <p>
                <strong>Tanzim Tarihi:</strong>{" "}
                {new Date(selectedPolicy.tanzimTarihi).toLocaleDateString()}
              </p>
              <p>
                <strong>Bitiş Tarihi:</strong>{" "}
                {new Date(selectedPolicy.bitisTarihi).toLocaleDateString()}
              </p>
              <p>
                <strong>Müşteri No:</strong>{" "}
                {selectedPolicy.musteriBilgileri.musteriNo}
              </p>
              <p>
                <strong>Müşteri Adı Soyadı:</strong>{" "}
                {selectedPolicy.musteriBilgileri.musteriAd}{" "}
                {selectedPolicy.musteriBilgileri.musteriSoyad}
              </p>
            </div>
            <div className={styles.carDetails}>
              {carDetails && (
                <div>
                  <h4>Araç Bilgileri</h4>
                  <p>
                    <strong>Plaka İl Kodu:</strong> {carDetails.plakaIlKodu}
                  </p>
                  <p>
                    <strong>Plaka Kodu:</strong> {carDetails.plakaKodu}
                  </p>
                  <p>
                    <strong>Marka:</strong> {carDetails.aracMarka}
                  </p>
                  <p>
                    <strong>Model:</strong> {carDetails.aracModel}
                  </p>
                  <p>
                    <strong>Model Yılı:</strong> {carDetails.aracModelYili}
                  </p>
                  <p>
                    <strong>Motor No:</strong> {carDetails.motorNo}
                  </p>
                  <p>
                    <strong>Şasi No:</strong> {carDetails.sasiNo}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return <p>Loading...</p>;
    }
  };

  return (
    <div className={styles.managePolicies}>
      <h1>Teklifleri Yönet</h1>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Poliçe numarasına göre ara"
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className={styles.dropdownWrapper}>
          <select
            className={styles.selectMenu}
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="">Filtrele</option>
            <option value="Teklif">Durumu Teklif olanlar</option>
            <option value="Kayıt">Durumu Kayıt olanlar</option>
          </select>
        </div>
        <div className={styles.dropdownWrapper}>
          <select
            className={styles.selectMenu}
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="desc">Sırala</option>
            <option value="asc">Eskiden Yeniye</option>
            <option value="desc">Yeniden Eskiye</option>
          </select>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Poliçe Türü</th>
            <th>Poliçe No</th>
            <th>Müşteri No</th>
            <th>Başlangıç Tarihi</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredPolicies.map((policy) => (
            <tr key={policy._id}>
              <td>{getProductTypeByBranchCode(policy.bransKodu)}</td>
              <td>{policy.policeNo}</td>
              <td>{policy.musteriBilgileri.musteriNo}</td>
              <td>{new Date(policy.baslangicTarihi).toLocaleDateString()}</td>
              <td>{policy.status === "T" ? "Teklif" : "Kayıt"}</td>
              <td>
                <button
                  onClick={() => handleShowDetails(policy)}
                  className={styles.detailsButton}
                >
                  Detaylar
                </button>
                <button
                  onClick={() => handleDeletePolicy(policy._id)}
                  className={styles.deleteButton}
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDetailsClicked && (
        <DetailsModal
          isOpen={isDetailsClicked}
          onClose={handleDetailsModalClose}
          content={detailsContent}
        />
      )}
    </div>
  );
}

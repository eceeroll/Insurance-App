import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import DetailsModal from "../DetailsModal/DetailsModal";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import styles from "./SearchCustomer.module.css";
import { getProductTypeByBranchCode } from "../../utils/getProductTypeByBranchCode";

Modal.setAppElement("#root");

export default function SearchCustomer() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [tcNo, setTcNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editTableField, setEditTableField] = useState("");
  const [customerPolicies, setCustomerPolicies] = useState([]);
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [detailsContent, setDetailsContent] = useState(null);

  useEffect(() => {
    if (tcNo || firstName || lastName) {
      fetchCustomers();
    } else {
      setCustomers([]);
      setIsSearchPerformed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tcNo, firstName, lastName]);

  useEffect(() => {
    if (selectedPolicy) {
      const content = renderModalContent();
      setDetailsContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPolicy]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/customers/musteri-ara",
        {
          params: {
            tc_no: tcNo,
            first_name: firstName,
            last_name: lastName,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const filteredCustomers = response.data.filter((customer) => {
        const matchesTcNo =
          tcNo.trim().toLowerCase() === "" ||
          customer.tc_no.trim().toLowerCase().startsWith(tcNo.toLowerCase());
        const matchesFirstName =
          firstName.trim().toLowerCase() === "" ||
          customer.first_name
            .trim()
            .toLowerCase()
            .startsWith(firstName.toLowerCase());
        const matchesLastName =
          lastName.trim().toLowerCase === "" ||
          customer.last_name
            .trim()
            .toLowerCase()
            .startsWith(lastName.toLowerCase());

        return matchesTcNo && matchesFirstName && matchesLastName;
      });

      setCustomers(filteredCustomers);
      setIsSearchPerformed(true);
    } catch (error) {
      console.error("Error while fetching customers:", error);
    }
  };

  const fetchAllCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/customers/musteri-ara",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(response.data);
      setIsSearchPerformed(true);
    } catch (error) {
      console.error("Error while fetching all customers:", error);
    }
  };

  const handleDelete = async (musteriNo) => {
    const confirmDelete = window.confirm(
      `${musteriNo} nolu müşteri silinecektir. Devam etmek istiyor musunuz?`
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/customers/musteri-ara/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert("Müşteri başarıyla silindi.");
        setCustomers(
          customers.filter((customer) => customer._id !== customerId)
        );
      }
    } catch (error) {
      console.error("Müşteri silme işlemi başarısız oldu:", error);
    }
  };

  const handleEditOffers = async (customerId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customers/policeler/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCustomerPolicies(response.data);
      setSelectedCustomer(customerId);
      setIsPoliciesModalOpen(true);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const handleEdit = async (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setEditTableField("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  const handleSaveUpdateForm = async () => {
    try {
      console.log("sending update:", selectedCustomer);
      await axios.put(
        `http://localhost:5000/api/customers/musteri-ara/${selectedCustomer._id}`,
        selectedCustomer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // müşteriler listesinde seçilen müşteriyi bulup güncelle
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer._id === selectedCustomer._id ? selectedCustomer : customer
        )
      );

      alert("Müşteri Bilgileri Güncellendi!");

      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePoliciesModalClose = () => {
    setIsPoliciesModalOpen(false);
    setCustomerPolicies([]);
  };

  const handlePayment = () => {
    console.log("dkd");
  };

  const handleDeletePolicy = async (policyId) => {
    const confirmDelete = window.confirm(
      `${policyId} id'li poliçe silinecektir. Devam etmek istiyor musunuz?`
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/customers/policeler/${policyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Poliçe Silindi");
        setCustomerPolicies((prevPolicies) =>
          prevPolicies.filter((policy) => policy._id !== policyId)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowPolicyDetails = async (policy) => {
    setShowPolicyDetails(true);
    setSelectedPolicy(policy);
    setIsPoliciesModalOpen(false);

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
                {selectedPolicy.musteriBilgileri.musteriNumarasi}
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

  const handleDetailsModalClose = () => {
    setShowPolicyDetails(false);
    setSelectedPolicy(null);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => navigate("/dashboard")}
      >
        Geri
      </button>
      <div className={styles.header}>
        <h2 className={styles.title}>Müşteri Arama</h2>
      </div>
      <form className={styles.form}>
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="firstName">Ad</label>
            <input
              name="firstName"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={styles["form-control"]}
              type="text"
            />
          </div>
          <div className={styles["form-group"]}>
            <label>Soyad</label>
            <input
              name="lastName"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={styles["form-control"]}
              type="text"
            />
          </div>
          <div className={styles["form-group"]}>
            <label>TC Kimlik No</label>
            <input
              name="tcNo"
              id="tcNo"
              value={tcNo}
              onChange={(e) => setTcNo(e.target.value)}
              className={styles["form-control"]}
              type="text"
            />
          </div>
        </div>
        <button
          type="button"
          className={styles.listAllButton}
          onClick={fetchAllCustomers}
        >
          Tümünü Listele
        </button>
      </form>
      {isSearchPerformed && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Müşteri No</th>
              <th>İsim</th>
              <th>Soyisim</th>
              <th>TC Kimlik No</th>
              <th>Teklifler</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.musteri_no}</td>
                <td>{customer.first_name}</td>
                <td>{customer.last_name}</td>
                <td>{customer.tc_no}</td>
                <td className={styles.actions}>
                  <button onClick={() => handleEdit(customer)}>Düzenle</button>
                  <button
                    style={{ backgroundColor: "red" }}
                    onClick={() => handleDelete(customer.musteri_no)}
                  >
                    Sil
                  </button>

                  <button
                    // style={{ backgroundColor: "orange" }}
                    onClick={() => handleEditOffers(customer._id)}
                  >
                    Teklifleri Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Müşteri Bilgileri Düzenle */}
      {isModalOpen && selectedCustomer && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleModalClose}
          contentLabel="Müşteri Bilgilerini Düzenle"
          className={styles.modal}
          overlayClassName={styles.overlay}
        >
          <h2>Müşteri Bilgilerini Düzenle</h2>
          <form className={styles.modalForm}>
            <div className={styles["form-group"]}>
              <label htmlFor="editFirstName">Ad</label>
              <input
                name="first_name"
                id="editFirstName"
                value={selectedCustomer.first_name}
                onChange={handleInputChange}
                className={styles["form-control"]}
                type="text"
                readOnly={editTableField !== "first_name"}
              />
              <FaEdit
                className={styles.editIcon}
                onClick={() => setEditTableField("first_name")}
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="editLastName">Soyad</label>
              <input
                name="last_name"
                id="editLastName"
                value={selectedCustomer.last_name}
                onChange={handleInputChange}
                className={styles["form-control"]}
                type="text"
                readOnly={editTableField !== "last_name"}
              />
              <FaEdit
                className={styles.editIcon}
                onClick={() => setEditTableField("last_name")}
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="editTcNo">TC Kimlik No</label>
              <input
                name="tc_no"
                id="editTcNo"
                value={selectedCustomer.tc_no}
                onChange={handleInputChange}
                className={styles["form-control"]}
                type="text"
                readOnly={editTableField !== "tc_no"}
              />
              <FaEdit
                className={styles.editIcon}
                onClick={() => setEditTableField("tc_no")}
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="editEmail">Soyad</label>
              <input
                name="email"
                id="editEmail"
                value={selectedCustomer.email}
                onChange={handleInputChange}
                className={styles["form-control"]}
                type="text"
                readOnly={editTableField !== "email"}
              />
              <FaEdit
                className={styles.editIcon}
                onClick={() => setEditTableField("email")}
              />
            </div>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSaveUpdateForm}
            >
              Kaydet
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleModalClose}
            >
              İptal
            </button>
          </form>
        </Modal>
      )}
      {/* Poliçeler Listesi Detayları */}
      {isPoliciesModalOpen && (
        <Modal
          isOpen={isPoliciesModalOpen}
          onRequestClose={handlePoliciesModalClose}
          className={`${styles.modal} ${styles.wideModal} `}
          overlayClassName={styles.overlay}
        >
          <h2>Poliçeler</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Poliçe No</th>
                <th>Poliçe Türü</th>
                <th>Prim</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {customerPolicies.map((policy) => (
                <tr key={policy._id}>
                  <td>{policy.policeNo}</td>
                  <td>{getProductTypeByBranchCode(policy.bransKodu)}</td>
                  <td>{policy.prim} ₺</td>
                  <td>{policy.status === "T" ? "Teklif" : "Kayıt"}</td>
                  <td>
                    {policy.status === "T" ? (
                      <Link
                        to={`/odeme-sayfasi?id=${policy._id}&prim=${policy.prim}`}
                        className={styles.paymentButton}
                        onClick={() => handlePayment(policy._id)}
                      >
                        Ödeme Yap
                      </Link>
                    ) : (
                      <button
                        style={{
                          padding: "3px 6px",
                          fontSize: "0.8rem",
                          display: "inline-block",
                          marginRight: "5px",
                          width: "50%",
                        }}
                        onClick={() => handleShowPolicyDetails(policy)}
                      >
                        Detaylar
                      </button>
                    )}

                    {policy.status === "T" ? (
                      <button
                        onClick={() => handleDeletePolicy(policy._id)}
                        style={{
                          padding: "3px 6px",
                          fontSize: "0.8rem",
                          display: "inline-block",
                          width: "40%",
                          backgroundColor: "#dc3545",
                        }}
                      >
                        İptal Et
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={handlePoliciesModalClose}
            className={styles.closeButton}
          >
            Kapat
          </button>
        </Modal>
      )}
      {/* Bir Poliçeye Ait Detaylar */}
      {showPolicyDetails && (
        <DetailsModal
          className={styles.detailsModal}
          isOpen={showPolicyDetails}
          onClose={handleDetailsModalClose}
          content={detailsContent}
        />
      )}
    </div>
  );
}

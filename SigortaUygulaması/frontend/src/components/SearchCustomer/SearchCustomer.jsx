import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import styles from "./SearchCustomer.module.css";

Modal.setAppElement("#root");

export default function SearchCustomer() {
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [tcNo, setTcNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const token = localStorage.getItem("token");
  const [editTableField, setEditTableField] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (tcNo || firstName || lastName) {
      fetchCustomers();
    } else {
      setCustomers([]);
      setIsSearchPerformed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tcNo, firstName, lastName]);

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
          tcNo === "" ||
          customer.tc_no.toLowerCase().startsWith(tcNo.toLowerCase());
        const matchesFirstName =
          firstName === "" ||
          customer.first_name.toLowerCase().startsWith(firstName.toLowerCase());
        const matchesLastName =
          lastName === "" ||
          customer.last_name.toLowerCase().startsWith(lastName.toLowerCase());

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

  const handleDelete = async (customerId) => {
    const confirmDelete = window.confirm(
      `${customerId} id'li müşteri silinecektir. Devam etmek istiyor musunuz?`
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

  const handleEditOffers = (customerId) => {
    console.log("Edit offers for customer with ID:", customerId);
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
              <th>ID</th>
              <th>İsim</th>
              <th>Soyisim</th>
              <th>TC Kimlik No</th>
              <th>Teklifler</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer._id}>
                <td>{index + 1}</td>
                <td>{customer.first_name}</td>
                <td>{customer.last_name}</td>
                <td>{customer.tc_no}</td>
                <td className={styles.actions}>
                  <button onClick={() => handleEdit(customer)}>Düzenle</button>
                  <button
                    style={{ backgroundColor: "red" }}
                    onClick={() => handleDelete(customer._id)}
                  >
                    Sil
                  </button>
                  <button
                    style={{ backgroundColor: "orange" }}
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
    </div>
  );
}

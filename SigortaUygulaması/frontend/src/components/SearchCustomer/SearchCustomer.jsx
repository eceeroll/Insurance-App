import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SearchCustomer.module.css";

export default function SearchCustomer() {
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const [tcNo, setTcNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customers, setCustomers] = useState([]);

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

  return (
    <body className={styles.body}>
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
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </body>
  );
}

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { ProductCodes } from "../../productCodes.js";
import Modal from "react-modal";
import styles from "./CreatePolicy.module.css";
import axios from "axios";

export default function CreatePolicy() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carData, setCarData] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState([]);
  const [modelYears, setModelYears] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [offerAmount, setOfferAmount] = useState(null);
  const [kaskoValue, setKaskoValue] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isPolicyCreated, setIsPolicyCreated] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [policyId, setPolicyId] = useState(null);
  const [policyPrim, setPolicyPrim] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Poliçeleştirme İşlemi
  const handleCreatePolicy = async () => {
    const userId = currentUser.id;
    const musteriNo = selectedCustomer;
    const carId = selectedCarId;

    try {
      const data = {
        ...formData,
        carId,
        musteriNo,
        prim: offerAmount,
        userId,
        username,
        bransKodu: selectedProduct,
      };

      const response = await axios.post(
        "http://localhost:5000/api/policy/yeni-police",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        const policyExpiryDate = new Date();
        policyExpiryDate.setDate(policyExpiryDate.getDate() + 15);

        const { _id } = response.data.newPolicy;
        setPolicyId(_id);
        setPolicyPrim(offerAmount);
        setExpiryDate(policyExpiryDate.toLocaleDateString());

        setIsPolicyCreated(true);
        // setIsOfferModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Teklif Alma İşlemi
  const handleSubmit = async (values) => {
    try {
      // form verilerini kaydet
      setFormData(values);

      // Kasko ve Prim Hesaplanır
      const car = carData.find((car) => selectedCarId === car._id);
      if (car) {
        setKaskoValue(car.kasko);
        const primValue = car.kasko * 0.1;
        setOfferAmount(primValue);
        setIsOfferModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      plakaIlKodu: "",
      plakaKodu: "",
      motorNo: "",
      sasiNo: "",
      carId: "",
    },
    validationSchema: Yup.object({
      plakaIlKodu: Yup.string().required("Bu alan boş bırakılamaz!"),
      plakaKodu: Yup.string().required("Bu alan boş bırakılamaz!"),
      motorNo: Yup.string()
        .min(10, "Motor No 10 haneden oluşmalıdır!")
        .required("Bu alan boş bırakılamaz!"),
      sasiNo: Yup.string()
        .min(12, "Şasi No 12 haneden oluşmalıdır.")
        .required("Bu alan boş bırakılamaz!"),
    }),
    onSubmit: handleSubmit,
  });

  // Fetch customers and cars data
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Set products
    setProducts(Object.values(ProductCodes));

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/customers/musteri-ara",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCustomers(response.data);
      } catch (error) {
        console.error("Bir hata oluştu:", error);
      }
    };

    const fetchCars = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/policy/arabalar",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Car data:", response.data);
        setCarData(response.data);
      } catch (error) {
        console.error("Bir hata oluştu:", error);
      }
    };
    fetchCars();
    fetchCustomers();
  }, []);

  // Form Modalini Açar
  const openModal = () => {
    if (selectedCustomer && selectedProduct) {
      setIsModalOpen(true);
      setAlertMessage(""); // Uyarıyı sıfırla
    } else {
      setAlertMessage("Lütfen Müşteri ve Ürün Seçimi Yapınız.");
      setTimeout(() => {
        setAlertMessage("");
      }, 2000);
    }
  };

  // Teklif Ekranını Kapat
  const closeOfferModal = () => {
    setIsOfferModalOpen(false);
    setIsPolicyCreated(false);
  };

  // Marka seçimi yapıldıktan sonra modelleri listeler
  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    const filteredModels = carData
      .filter((car) => car.brand === brand)
      .map((car) => car.model);
    setModels([...new Set(filteredModels)]);
    // Kullanıcı yeniden bir marka seçerse model seçimi ve yıl seçimini sıfırla
    setSelectedModel("");
    setModelYears([]);
    // Eğer Id varsa sıfırla
    setSelectedCarId("");
  };

  // Model seçildikten sonra yılları listeler
  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    const filteredYears = carData
      .filter((car) => car.brand === selectedBrand && car.model === model)
      .map((car) => car.modelYear);
    setModelYears([...new Set(filteredYears)]);
    setSelectedCarId("");
  };

  const handleModelYearChange = (e) => {
    const year = e.target.value;
    const filteredCars = carData.filter(
      (car) =>
        car.brand === selectedBrand &&
        car.model === selectedModel &&
        car.modelYear === parseInt(year, 10)
    );
    if (filteredCars.length > 0) {
      setSelectedCarId(filteredCars[0]._id);
    } else {
      setSelectedCarId("");
    }
  };

  // Form Modalini Kapat
  const handleCloseModal = (resetForm) => {
    resetForm();
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      {/* Ürün ve Müşteri Seçimi */}
      <div className={styles.selectRow}>
        <div className={styles.selectContainer}>
          <label htmlFor="product-select">Ürün Seçiniz:</label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Seçiniz</option>
            {products.map((product) => (
              <option key={product.code} value={product.code}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.selectContainer}>
          <label htmlFor="customer-select">Müşteri Seçiniz:</label>
          <select
            id="customer-select"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">Seçiniz</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.first_name} {customer.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {alertMessage && <div className={styles.alert}>{alertMessage}</div>}{" "}
      <div className={styles.gridContainer}>
        <button onClick={openModal} className={styles.createPolicyButton}>
          Poliçe Oluştur
        </button>
      </div>
      {/* Form Doldurma - KASKO - TRAFİK */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => handleCloseModal(formik.resetForm)}
        className={styles.modal}
        overlayClassName={styles.overlay}
        contentLabel="Policy Form Modal"
      >
        <form onSubmit={formik.handleSubmit}>
          <div className={styles.inputRow}>
            <div className={styles.inputContainer}>
              <label htmlFor="plakaIlKodu">Plaka İl Kodu:</label>
              <input
                type="text"
                id="plakaIlKodu"
                name="plakaIlKodu"
                value={formik.values.plakaIlKodu}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.plakaIlKodu && formik.errors.plakaIlKodu ? (
                <div className={styles.error}>{formik.errors.plakaIlKodu}</div>
              ) : null}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="plakaKodu">Plaka Kodu:</label>
              <input
                type="text"
                id="plakaKodu"
                name="plakaKodu"
                value={formik.values.plakaKodu}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.plakaKodu && formik.errors.plakaKodu ? (
                <div className={styles.error}>{formik.errors.plakaKodu}</div>
              ) : null}
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputContainer}>
              <label htmlFor="brand">Marka:</label>
              <select
                id="brand"
                value={selectedBrand}
                onChange={handleBrandChange}
              >
                <option value="">Seçiniz</option>
                {[...new Set(carData.map((car) => car.brand))].map(
                  (brand, index) => (
                    <option key={index} value={brand}>
                      {brand}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="model">Model:</label>
              <select
                id="model"
                value={selectedModel}
                onChange={handleModelChange}
              >
                <option value="">Seçiniz</option>
                {models.map((model, index) => (
                  <option key={index} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputContainer}>
              <label htmlFor="modelYear">Model Yılı:</label>
              <select onChange={handleModelYearChange} id="modelYear">
                <option value="">Seçiniz</option>
                {modelYears.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputContainer}>
              <label htmlFor="motorNo">Motor No:</label>
              <input
                type="text"
                maxLength="10"
                id="motorNo"
                name="motorNo"
                value={formik.values.motorNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.motorNo && formik.errors.motorNo ? (
                <div className={styles.error}>{formik.errors.motorNo}</div>
              ) : null}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="sasiNo">Şasi No:</label>
              <input
                type="text"
                maxLength="12"
                id="sasiNo"
                name="sasiNo"
                value={formik.values.sasiNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.sasiNo && formik.errors.sasiNo ? (
                <div className={styles.error}>{formik.errors.sasiNo}</div>
              ) : null}
            </div>
          </div>
          <button type="submit">Teklif Al</button>
        </form>
      </Modal>
      {/* Teklif Göster */}
      <Modal
        isOpen={isOfferModalOpen}
        onRequestClose={closeOfferModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
        contentLabel="Offer Modal"
      >
        <div className={styles.offerContainer}>
          <p className={styles.offerText}>
            Kasko Değeri: <strong>{kaskoValue} TL</strong>
          </p>
          <p className={styles.offerText}>
            Poliçe Teklifi: <strong>{offerAmount} TL</strong>
          </p>
          <div className={styles.buttonRow}>
            <button onClick={handleCreatePolicy} className={styles.button}>
              Poliçeleştir
            </button>
            <button
              onClick={closeOfferModal}
              className={`${styles.button} ${styles.closeButton}`}
            >
              Kapat
            </button>
          </div>
          {/* Poliçe Oluşturuldu Mesajı */}
          {isPolicyCreated && (
            <>
              <p className={styles.infoText}>
                Poliçeniz oluşturuldu. Teklif <strong>{expiryDate}</strong>{" "}
                tarihine kadar geçerlidir.
              </p>
              <Link
                to={`/odeme-sayfasi?id=${policyId}&prim=${policyPrim}`}
                className={styles.paymentLink}
              >
                Ödeme ekranına geçin
              </Link>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

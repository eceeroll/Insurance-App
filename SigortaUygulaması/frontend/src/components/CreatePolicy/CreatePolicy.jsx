import styles from "./CreatePolicy.module.css";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link } from "react-router-dom";
import { ProductCodes } from "../../productCodes.js";
import DetailsModal from "../DetailsModal/DetailsModal.jsx";
import Modal from "react-modal";
import BackButton from "../BackButton.jsx";
import { calculateAge } from "../../utils/calculateAge.js";

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
  // eslint-disable-next-line no-unused-vars
  const [kaskoValue, setKaskoValue] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isPolicyCreated, setIsPolicyCreated] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [policyId, setPolicyId] = useState(null);
  const [policyPrim, setPolicyPrim] = useState(null);
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [detailsContent, setDetailsContent] = useState(null);
  const [buttonsVisible, setButtonsVisible] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // müşteri bilgileri çek
  const fetchCustomerData = async (customerId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customers/musteri-ara/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      return data;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  // yaş faktörünü hesaplama ( sağlık poliçe için )
  const getAgeFactor = (age) => {
    if (age < 20) return 0; // 20 yaş altı için ek prim yok
    if (age < 30) return 100;
    if (age < 40) return 200;
    if (age < 50) return 300;
    return 500; // 50 yaş ve üstü için ek prim
  };

  const calculateHealthOffer = async (values) => {
    // önce müşterinin yaşı hesaplanır
    const customerData = await fetchCustomerData(selectedCustomer);
    const { date_of_birth } = customerData;

    const age = calculateAge(date_of_birth);

    const {
      alkolKullanimi,
      ameliyat,
      sporYapma,
      sigaraKullanimi,
      kronikHastalik,
      ilacKullanimi,
    } = values;

    // risk katsayıları
    const katsayilar = {
      alkolKullanimi: 0.2,
      ameliyat: 0.3,
      // spor yapmak azaltır
      sporYapma: -0.1,
      sigaraKullanimi: 0.4,
      kronikHastalik: 0.5,
      ilacKullanimi: 0.2,
    };

    const ageFactor = getAgeFactor(age);

    const riskFaktoruEtkiliMi = (value) => {
      return value === "E" ? 1 : 0;
    };

    const toplamRisk =
      riskFaktoruEtkiliMi(alkolKullanimi) * katsayilar.alkolKullanimi +
      riskFaktoruEtkiliMi(ameliyat) * katsayilar.ameliyat +
      riskFaktoruEtkiliMi(sporYapma) * katsayilar.sporYapma +
      riskFaktoruEtkiliMi(sigaraKullanimi) * katsayilar.sigaraKullanimi +
      riskFaktoruEtkiliMi(kronikHastalik) * katsayilar.kronikHastalik +
      riskFaktoruEtkiliMi(ilacKullanimi) * katsayilar.ilacKullanimi;

    const temelPrimMiktarı = 2000;

    const kaskoTutari =
      temelPrimMiktarı + temelPrimMiktarı * toplamRisk + ageFactor;

    return kaskoTutari;
  };

  const calculateDaskOffer = (
    insaYili,
    binaKat,
    binaMetreKare,
    hasarDurumu
  ) => {
    const hasarIndirimleri = {
      hasarsiz: 0,
      azHasarli: 0.1,
      cokHasarli: 0.3,
    };

    const currentYear = new Date().getFullYear();
    const binaYasi = currentYear - insaYili;

    // her yıl için yüzde 5 indirim
    const insaYiliKatsayi = 0.05;
    // metre kare başına 50
    const metreKareKatsayi = 10;
    // kat başına 500
    const binaKatKatsayi = 200;
    // hasarlı veya çok hasarlı için indirim
    const hasarDurumuKatsayi = hasarIndirimleri[hasarDurumu] || 0;

    // bina kat sayısı ve metrekareye göre kasko değeri
    let kaskoTutari =
      binaKat * binaKatKatsayi + binaMetreKare * metreKareKatsayi;

    // metre kare başına yaş indirimi
    kaskoTutari = kaskoTutari - insaYiliKatsayi * binaYasi * binaMetreKare;

    // hasar durumu indirimi
    kaskoTutari = kaskoTutari * (1 - hasarDurumuKatsayi);

    // alt sınır 1000 tl ye ekle
    return kaskoTutari + 1000;
  };

  // Poliçeleştirme İşlemi
  const handleCreatePolicy = async () => {
    const userId = currentUser.id;
    const musteriNo = selectedCustomer;
    const carId = selectedCarId;

    try {
      let data;
      if ((selectedProduct === "310") | (selectedProduct === "340")) {
        data = {
          ...formData,
          carId,
          musteriNo,
          prim: offerAmount,
          userId,
          username,
          bransKodu: selectedProduct,
        };
      } else if (selectedProduct === "199") {
        data = {
          binaBilgileri: formData,
          musteriNo,
          prim: offerAmount,
          userId,
          username,
          bransKodu: selectedProduct,
        };
      } else if (selectedProduct === "610") {
        data = {
          ...formData,
          musteriNo,
          prim: offerAmount,
          userId,
          username,
          bransKodu: selectedProduct,
        };
      }

      console.log("DATA:", data);

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
        const { newPolicy } = response.data;
        setPolicyId(_id);
        setPolicyPrim(offerAmount);
        setExpiryDate(policyExpiryDate.toLocaleDateString());

        setIsPolicyCreated(true);
        setButtonsVisible(false);

        // başlangıç bitiş tarihi ve poliçe no içeren modal içeriği
        const detailsContent = (
          <>
            <h2>Poliçe Detayları</h2>
            <p>
              <strong>Poliçe No:</strong> {newPolicy.policeNo}
            </p>
            <p>
              <strong>Başlangıç Tarihi:</strong>{" "}
              {new Date(newPolicy.baslangicTarihi).toLocaleDateString()}
            </p>
            <p>
              <strong>Bitiş Tarihi:</strong>{" "}
              {new Date(newPolicy.bitisTarihi).toLocaleDateString()}{" "}
            </p>
          </>
        );

        setDetailsContent(detailsContent);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Teklif Alma İşlemi
  const handleSubmit = async (values) => {
    console.log("Form values:", values);
    console.log("selected product", selectedProduct);
    try {
      setFormData(values);

      // Kasko ve Prim Hesaplama
      if (selectedProduct === "310" || selectedProduct === "340") {
        const car = carData.find((car) => selectedCarId === car._id);
        if (car) {
          setKaskoValue(car.kasko);
          const primKasko = car.kasko * 0.1;
          setOfferAmount(primKasko);
          setIsModalOpen(false);
          setIsOfferModalOpen(true);
          formikKaskoTrafik.resetForm();
        }
      } else if (selectedProduct === "199") {
        const { hasarDurumu, insaYili, binaMetreKare, binaKat } = values;

        const primDask = calculateDaskOffer(
          insaYili,
          binaKat,
          binaMetreKare,
          hasarDurumu
        );

        setOfferAmount(primDask);
        setIsModalOpen(false);
        setIsOfferModalOpen(true);
        formikDask.resetForm();
      } else if (selectedProduct === "610") {
        const primHealth = await calculateHealthOffer(values);
        console.log("selected customer:", selectedCustomer);
        setOfferAmount(primHealth);
        setIsModalOpen(false);
        setIsOfferModalOpen(true);
        formikSaglik.resetForm();
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const formikSaglik = useFormik({
    initialValues: {
      sigaraKullanimi: "",
      alkolKullanimi: "",
      sporYapma: "",
      ameliyat: "",
      kronikHastalik: "",
      ilacKullanimi: "",
    },
    validationSchema: Yup.object({
      sigaraKullanimi: Yup.string().required("Bu alan gereklidir."),
      alkolKullanimi: Yup.string().required("Bu alan gereklidir."),
      sporYapma: Yup.string().required("Bu alan gereklidir."),
      ameliyat: Yup.string().required("Bu alan gereklidir."),
      kronikHastalik: Yup.string().required("Bu alan gereklidir."),
      ilacKullanimi: Yup.string().required("Bu alan gereklidir."),
    }),
    onSubmit: handleSubmit,
  });

  const formikDask = useFormik({
    initialValues: {
      uavtAdresKodu: "",
      binaMetreKare: "",
      binaKat: "",
      yapiTarzi: "",
      insaYili: "",
      hasarDurumu: "",
    },
    validationSchema: Yup.object({
      uavtAdresKodu: Yup.string()
        .max(10, "UAVT adres kodu 10 haneden uzun olmamalıdır.")
        .required("UAVT adres kodu gereklidir."),
      // DASK
      binaMetreKare: Yup.number()
        .positive("Bina metre kare değeri negatif olamaz.")
        .required("Bina metre kare gereklidir."),
      binaKat: Yup.number()
        .positive("Bina kat değeri negatif olamaz.")
        .required("Bina kat gereklidir."),
      yapiTarzi: Yup.string().required("Yapı tarzı gereklidir."),
      insaYili: Yup.number()
        .positive("İnşa yılı negatif olamaz.")
        .integer("İnşa yılı geçerli bir yıl olmalıdır.")
        .min(1000, "İnşa yılı 4 haneli olmalıdır.")
        .max(9999, "İnşa yılı 4 haneli olmalıdır.")
        .test("not-future", "Geçerli bir inşa yılı giriniz.", (value) => {
          const currentUser = new Date().getFullYear();
          return value <= currentUser;
        })
        .required("İnşa yılı gereklidir."),
      hasarDurumu: Yup.string().required("Hasar durumu gereklidir."),
    }),
    onSubmit: handleSubmit,
  });

  const formikKaskoTrafik = useFormik({
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
    setButtonsVisible(true);
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
    setButtonsVisible(true);
  };

  const handleClosePolicyDetails = () => {
    setShowPolicyDetails(false);
  };

  const handleButtonClick = (field, value) => {
    formikSaglik.setFieldValue(field, value);
  };

  return (
    <div className={styles.container}>
      <BackButton />
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
      {(selectedProduct === "310" || selectedProduct === "340") && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => handleCloseModal(formikKaskoTrafik.resetForm)}
          className={styles.modal}
          overlayClassName={styles.overlay}
          contentLabel="Policy Form Modal"
        >
          <form onSubmit={formikKaskoTrafik.handleSubmit}>
            <div className={styles.inputRow}>
              <div className={styles.inputContainer}>
                <label htmlFor="plakaIlKodu">Plaka İl Kodu:</label>
                <input
                  type="text"
                  id="plakaIlKodu"
                  name="plakaIlKodu"
                  value={formikKaskoTrafik.values.plakaIlKodu}
                  onChange={formikKaskoTrafik.handleChange}
                  onBlur={formikKaskoTrafik.handleBlur}
                />
                {formikKaskoTrafik.touched.plakaIlKodu &&
                formikKaskoTrafik.errors.plakaIlKodu ? (
                  <div className={styles.error}>
                    {formikKaskoTrafik.errors.plakaIlKodu}
                  </div>
                ) : null}
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="plakaKodu">Plaka Kodu:</label>
                <input
                  type="text"
                  id="plakaKodu"
                  name="plakaKodu"
                  value={formikKaskoTrafik.values.plakaKodu}
                  onChange={formikKaskoTrafik.handleChange}
                  onBlur={formikKaskoTrafik.handleBlur}
                />
                {formikKaskoTrafik.touched.plakaKodu &&
                formikKaskoTrafik.errors.plakaKodu ? (
                  <div className={styles.error}>
                    {formikKaskoTrafik.errors.plakaKodu}
                  </div>
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
                  value={formikKaskoTrafik.values.motorNo}
                  onChange={formikKaskoTrafik.handleChange}
                  onBlur={formikKaskoTrafik.handleBlur}
                />
                {formikKaskoTrafik.touched.motorNo &&
                formikKaskoTrafik.errors.motorNo ? (
                  <div className={styles.error}>
                    {formikKaskoTrafik.errors.motorNo}
                  </div>
                ) : null}
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="sasiNo">Şasi No:</label>
                <input
                  type="text"
                  maxLength="12"
                  id="sasiNo"
                  name="sasiNo"
                  value={formikKaskoTrafik.values.sasiNo}
                  onChange={formikKaskoTrafik.handleChange}
                  onBlur={formikKaskoTrafik.handleBlur}
                />
                {formikKaskoTrafik.touched.sasiNo &&
                formikKaskoTrafik.errors.sasiNo ? (
                  <div className={styles.error}>
                    {formikKaskoTrafik.errors.sasiNo}
                  </div>
                ) : null}
              </div>
            </div>
            <button type="submit">Teklif Al</button>
          </form>
        </Modal>
      )}
      {/* Form Doldurma - DASK */}
      {selectedProduct === "199" && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => handleCloseModal(formikDask.resetForm)}
          className={styles.modal}
          overlayClassName={styles.overlay}
          contentLabel="Policy Form Modal"
        >
          <form onSubmit={formikDask.handleSubmit}>
            <div className={styles.inputRow}>
              <div className={styles.inputContainer}>
                <label htmlFor="uavtAdresKodu">UAVT Adres Kodu:</label>
                <input
                  type="text"
                  id="uavtAdresKodu"
                  name="uavtAdresKodu"
                  maxLength="10"
                  value={formikDask.values.uavtAdresKodu}
                  onChange={formikDask.handleChange}
                  onBlur={formikDask.handleBlur}
                />
                {formikDask.touched.uavtAdresKodu &&
                formikDask.errors.uavtAdresKodu ? (
                  <div className={styles.error}>
                    {formikDask.errors.uavtAdresKodu}
                  </div>
                ) : null}
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="binaMetreKare">Bina Metre Kare:</label>
                <input
                  type="number"
                  id="binaMetreKare"
                  name="binaMetreKare"
                  value={formikDask.values.binaMetreKare}
                  onChange={formikDask.handleChange}
                  onBlur={formikDask.handleBlur}
                />
                {formikDask.touched.binaMetreKare &&
                formikDask.errors.binaMetreKare ? (
                  <div className={styles.error}>
                    {formikDask.errors.binaMetreKare}
                  </div>
                ) : null}
              </div>
            </div>
            <div className={styles.inputRow}>
              <div className={styles.inputContainer}>
                <label htmlFor="binaKat">Bina Kat Sayısı</label>
                <input
                  type="number"
                  id="binaKat"
                  name="binaKat"
                  value={formikDask.values.binaKat}
                  onChange={formikDask.handleChange}
                  onBlur={formikDask.handleBlur}
                />
                {formikDask.touched.binaKat && formikDask.errors.binaKat ? (
                  <div className={styles.error}>
                    {formikDask.errors.binaKat}
                  </div>
                ) : null}
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="yapiTarzi">Yapı Tarzı:</label>
                <select
                  id="yapiTarzi"
                  name="yapiTarzi"
                  value={formikDask.values.yapiTarzi}
                  onChange={formikDask.handleChange}
                  onBlur={formikDask.handleBlur}
                >
                  <option value="">Seçiniz</option>
                  <option value="daire">Daire</option>
                  <option value="rezidans">Rezidans</option>
                  <option value="villa">Villa</option>
                  <option value="ofis">Ofis</option>
                  <option value="mustakil">Müstakil Ev</option>
                </select>
                {formikDask.touched.yapiTarzi && formikDask.errors.yapiTarzi ? (
                  <div className={styles.error}>
                    {formikDask.errors.yapiTarzi}
                  </div>
                ) : null}
              </div>
            </div>
            <div className={styles.inputRow}>
              <div className={styles.inputContainer}>
                <label htmlFor="insaYili">İnşa Yılı:</label>
                <input
                  type="number"
                  id="insaYili"
                  name="insaYili"
                  maxLength="4"
                  value={formikDask.values.insaYili}
                  onChange={formikDask.handleChange}
                  onBlur={formikDask.handleBlur}
                />
                {formikDask.touched.insaYili && formikDask.errors.insaYili ? (
                  <div className={styles.error}>
                    {formikDask.errors.insaYili}
                  </div>
                ) : null}
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="hasarDurumu">Hasar Durumu:</label>
                <select
                  id="hasarDurumu"
                  name="hasarDurumu"
                  value={formikDask.values.hasarDurumu}
                  onChange={formikDask.handleChange}
                  onBlur={formikDask.handleBlur}
                >
                  <option value="">Seçiniz</option>
                  <option value="hasarsiz">Hasarsız</option>
                  <option value="azHasarli">Az Hasarlı</option>
                  <option value="cokHasarli">Çok Hasarlı</option>
                </select>
                {formikDask.touched.hasarDurumu &&
                formikDask.errors.hasarDurumu ? (
                  <div className={styles.error}>
                    {formikDask.errors.hasarDurumu}
                  </div>
                ) : null}
              </div>
            </div>
            <button type="submit">Teklif Al</button>
          </form>
        </Modal>
      )}
      {/* Form Doldurma - SAĞLIK */}
      {selectedProduct === "610" && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => handleCloseModal(formikDask.resetForm)}
          className={styles.modal}
          overlayClassName={styles.overlay}
          contentLabel="Health Form Modal"
        >
          <form
            onSubmit={formikSaglik.handleSubmit}
            className={styles.healthForm}
          >
            <div className={styles.formRow}>
              <label>Sigara içiyor mu?</label>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.sigaraKullanimi === "E"
                      ? styles.activeYes
                      : ""
                  }`}
                  onClick={() => handleButtonClick("sigaraKullanimi", "E")}
                >
                  E
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.sigaraKullanimi === "H"
                      ? styles.activeNo
                      : ""
                  }`}
                  onClick={() => handleButtonClick("sigaraKullanimi", "H")}
                >
                  H
                </button>
              </div>
            </div>
            <div className={styles.formRow}>
              <label>Alkol kullanıyor mu?</label>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.alkolKullanimi === "E"
                      ? styles.activeYes
                      : ""
                  }`}
                  onClick={() => handleButtonClick("alkolKullanimi", "E")}
                >
                  E
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.alkolKullanimi === "H"
                      ? styles.activeNo
                      : ""
                  }`}
                  onClick={() => handleButtonClick("alkolKullanimi", "H")}
                >
                  H
                </button>
              </div>
            </div>
            <div className={styles.formRow}>
              <label>Ameliyat geçirdi mi?</label>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.ameliyat === "E" ? styles.activeYes : ""
                  }`}
                  onClick={() => handleButtonClick("ameliyat", "E")}
                >
                  E
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.ameliyat === "H" ? styles.activeNo : ""
                  }`}
                  onClick={() => handleButtonClick("ameliyat", "H")}
                >
                  H
                </button>
              </div>
            </div>
            <div className={styles.formRow}>
              <label>Spor yapıyor mu?</label>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.sporYapma === "E"
                      ? styles.activeYes
                      : ""
                  }`}
                  onClick={() => handleButtonClick("sporYapma", "E")}
                >
                  E
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.sporYapma === "H" ? styles.activeNo : ""
                  }`}
                  onClick={() => handleButtonClick("sporYapma", "H")}
                >
                  H
                </button>
              </div>
            </div>
            <div className={styles.formRow}>
              <label>Kronik bir hastalığı var mı?</label>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.kronikHastalik === "E"
                      ? styles.activeYes
                      : ""
                  }`}
                  onClick={() => handleButtonClick("kronikHastalik", "E")}
                >
                  E
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.kronikHastalik === "H"
                      ? styles.activeNo
                      : ""
                  }`}
                  onClick={() => handleButtonClick("kronikHastalik", "H")}
                >
                  H
                </button>
              </div>
            </div>
            <div className={styles.formRow}>
              <label>Düzenli kullandığı bir ilaç var mı?</label>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.ilacKullanimi === "E"
                      ? styles.activeYes
                      : ""
                  }`}
                  onClick={() => handleButtonClick("ilacKullanimi", "E")}
                >
                  E
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    formikSaglik.values.ilacKullanimi === "H"
                      ? styles.activeNo
                      : ""
                  }`}
                  onClick={() => handleButtonClick("ilacKullanimi", "H")}
                >
                  H
                </button>
              </div>
            </div>
            <button type="submit" className={styles.submitButton}>
              Teklif Al
            </button>
          </form>
        </Modal>
      )}
      {/* Teklif Göster */}
      <Modal
        isOpen={isOfferModalOpen}
        onRequestClose={closeOfferModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
        contentLabel="Offer Modal"
      >
        <div className={styles.offerContainer}>
          {(selectedProduct === "310" || selectedProduct === "340") && (
            <p className={styles.offerText}>
              Kasko Değeri: <strong>{offerAmount} TL</strong>
            </p>
          )}
          <p className={styles.offerText}>
            Poliçe Teklifi: <strong>{offerAmount} TL</strong>
          </p>

          {buttonsVisible && (
            <div className={styles.buttonRow}>
              <button
                onClick={handleCreatePolicy}
                className={`${styles.button} ${styles.createPolicyButton}`}
              >
                Poliçeleştir
              </button>
              <button
                onClick={closeOfferModal}
                className={`${styles.button} ${styles.closeButton}`}
              >
                Kapat
              </button>
            </div>
          )}

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
              <button
                className={styles.detailsButton}
                onClick={() => setShowPolicyDetails(true)}
              >
                Poliçe Detaylarını Görüntüle
              </button>
            </>
          )}
        </div>
      </Modal>
      {/* Poliçe Detayları Modal */}
      <DetailsModal
        isOpen={showPolicyDetails}
        className={styles.detailsModal}
        content={detailsContent}
        onClose={handleClosePolicyDetails}
      />
    </div>
  );
}

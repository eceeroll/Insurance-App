import { useRef, useState, useEffect } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";

import Modal from "react-modal";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./PaymentPage.module.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDFComponent from "../PDFComponent/PDFComponent";

// Modal için stil dosyalarını ayarlayın
Modal.setAppElement("#root");

const PaymentPage = () => {
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const pdfContentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // URL'den parametreleri al
  const searchParams = new URLSearchParams(location.search);
  const policyId = searchParams.get("id");
  const prim = searchParams.get("prim");

  // Ödeme işlemi başarılı olduğunda modal'ı aç
  const handlePaymentSuccess = () => {
    setModalIsOpen(true);
  };

  // Modal'ı kapat
  const closeModal = () => {
    setModalIsOpen(false);
    navigate("/dashboard");
  };

  const generatePDF = async (policyId) => {
    if (!policyId) {
      console.error("Policy not provided");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/policy/policeler/${policyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { policy: detailedPolicy, carDetails } = response.data;

      const customerResponse = await axios.get(
        `http://localhost:5000/api/customers/musteri-ara/${detailedPolicy.musteriBilgileri.musteriNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomerDetails(customerResponse.data);
      setSelectedPolicy(detailedPolicy);
      setCarDetails(carDetails);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Kart numarasını 4erli gruplar olarak böler
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 16) {
      value = value.slice(0, 16);
    }

    let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;

    setCardNumber(formattedValue);
  };

  // Ay / Yıl olarak formatla
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 3) {
      value = value.slice(0, 2) + " / " + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ödeme işlemi tamamlandıktan sonra, ilgili policy status'ünü güncelle
    const response = await fetch(
      `http://localhost:5000/api/policy/update-status/${policyId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "K" }),
      }
    );

    if (response.ok) {
      handlePaymentSuccess();
    } else {
      alert("Ödeme işlemi sırasında bir hata oluştu.");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR").format(amount);
  };

  // State güncellendikten sonra PDF oluşturma işlemini başlat
  useEffect(() => {
    if (selectedPolicy && carDetails && customerDetails) {
      const input = pdfContentRef.current;

      if (!input) {
        console.error("Element not found");
        return;
      }

      setTimeout(() => {
        html2canvas(input, { scale: 2 })
          .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            // Yazı tipini Helvetica olarak ayarla
            pdf.setFont("Helvetica");
            pdf.setFontSize(6);

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const padding = 10;
            const imgWidth = pageWidth - padding * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // İçeriği merkeze almak için x ve y pozisyonlarını ayarla
            const xPosition = padding;
            const yPosition = padding;

            pdf.addImage(
              imgData,
              "PNG",
              xPosition,
              yPosition,
              imgWidth,
              imgHeight
            );

            // Çok sayfalı PDF için kontroller
            if (imgHeight > pageHeight - padding * 2) {
              pdf.addPage();
              pdf.addImage(
                imgData,
                "PNG",
                xPosition,
                yPosition - pageHeight + padding * 2,
                imgWidth,
                imgHeight
              );
            }

            // PDF dosyasını kaydet
            pdf.save(`${selectedPolicy.policeNo}-details.pdf`);
          })
          .catch((error) => {
            console.error("Error generating PDF:", error);
          });
      }, 1000);
    }
  }, [selectedPolicy, carDetails, customerDetails]);

  return (
    <div className={styles["payment-container"]}>
      <h1>Ödeme Ekranı</h1>
      <form onSubmit={handleSubmit} className={styles["payment-form"]}>
        <div className={styles["form-group"]}>
          <input
            type="text"
            placeholder="Kart Üzerindeki Ad Soyad"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <input
            type="text"
            placeholder="Kart Numarası"
            value={cardNumber}
            onChange={handleCardNumberChange}
            maxLength="19"
            required
          />
        </div>
        <div className={styles["input-row"]}>
          <div className={styles["form-group"]}>
            <input
              type="text"
              placeholder="Ay / Yıl"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              required
            />
          </div>
          <div className={styles["form-group"]}>
            <input
              type="text"
              placeholder="CVC"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength="3"
              required
            />
          </div>
        </div>
        <button type="submit" className={styles["payment-button"]}>
          {formatCurrency(prim)} TL ÖDE
        </button>
      </form>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Ödeme Başarıyla Tamamlandı"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <div className={styles.modalContent}>
          <AiOutlineCheckCircle className={styles.successIcon} />

          <h2>Ödeme Başarıyla Tamamlandı</h2>
          <p>Poliçeniz işleme alınmıştır.</p>
          <p>PDF oluşturun:</p>
          <button
            onClick={() => generatePDF(policyId)}
            className={styles.generatePdfButton}
          >
            PDF Oluştur
          </button>
          <button onClick={closeModal} className={styles.closeButton}>
            Kapat
          </button>
        </div>
      </Modal>

      {selectedPolicy && customerDetails && (
        <div className={styles.pdfcontent} ref={pdfContentRef}>
          <PDFComponent
            carInfo={carDetails}
            policyInfo={selectedPolicy}
            customerInfo={customerDetails}
            bransKodu={selectedPolicy?.bransKodu}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentPage;

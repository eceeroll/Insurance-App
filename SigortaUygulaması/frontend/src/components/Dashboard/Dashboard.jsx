import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaUser } from "react-icons/fa"; // Profil ikonu

import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import PDFComponent from "../PDFComponent/PDFComponent";
import { Link } from "react-router-dom";
import { getProductTypeByBranchCode } from "../../utils/getProductTypeByBranchCode";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  // eslint-disable-next-line no-unused-vars
  const [allPolicies, setAllPolicies] = useState([]);
  const [pendingPolicies, setPendingPolicies] = useState([]);
  const [processedPolicies, setProcessedPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isPdfHidden, setIsPdfHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pdfContentRef = useRef(null);

  useEffect(() => {
    const fetchAllPolicies = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/policy/policeler",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAllPolicies(response.data);

        // Status T olan poliçeleri filtrele
        const pending = response.data.filter((policy) => policy.status === "T");
        // Status K olan poliçeleri filtrele
        const processed = response.data.filter(
          (policy) => policy.status === "K"
        );

        setPendingPolicies(pending);
        setProcessedPolicies(processed);
      } catch (error) {
        console.error("Error fetching policies:", error);
      }
    };

    fetchAllPolicies();
  }, [token]);

  const generatePDF = async (policy) => {
    // 3 saniye bekle ve sonra `pdfdiv`'in `hidden` sınıfını ayarla
    setTimeout(() => {
      setIsPdfHidden(true);
    }, 500); // 3 saniye

    if (!policy) {
      console.error("Policy not provided");
      return;
    }

    const response = await axios.get(
      `http://localhost:5000/api/policy/policeler/${policy._id}`,
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

    setTimeout(() => {
      const input = pdfContentRef.current;

      if (!input) {
        console.error("Element not found");
        return;
      }

      html2canvas(input)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");

          // Set font to Helvetica (a simple font)
          pdf.setFont("Helvetica");

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const padding = 20; // Add padding
          const imgWidth = pageWidth - padding * 2;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Center the content by adjusting the x-position
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

          // Save the PDF with the policy number in the file name
          pdf.save(`${policy.policeNo}-details.pdf`);
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
        });
    }, 0);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    if (window.confirm("Emin misiniz?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      navigate("/login");
    }
  };

  function calculateRemainingTime(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const timeDifference = end - now;

    if (timeDifference <= 0) {
      return "Süre doldu"; // Eğer süre dolmuşsa
    }

    const daysRemaining = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    return `${daysRemaining} gün ${hoursRemaining} saat`;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.dashboard}>
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
      <div className={styles.menu}>
        <button onClick={() => handleNavigation("/yeni-musteri")}>
          Yeni Müşteri
        </button>
        <button onClick={() => handleNavigation("/musteri-ara")}>
          Müşteri Ara
        </button>
        <button onClick={() => handleNavigation("/yeni-police")}>
          Yeni Poliçe
        </button>
        <button onClick={() => handleNavigation("/police-ara")}>
          Poliçe Ara
        </button>
      </div>
      <div className={styles.tablesContainer}>
        <div className={styles.tableSection}>
          <h2>Son Oluşturulan Teklifler</h2>
          <table>
            <thead>
              <tr>
                <th>Poliçe Türü</th>
                <th>Poliçe No</th>
                <th>Müşteri Adı</th>
                <th>Kalan Süre</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {pendingPolicies.map((policy) => (
                <tr key={policy._id}>
                  <td>{getProductTypeByBranchCode(policy.bransKodu)}</td>
                  <td>{policy.policeNo}</td>
                  <td>
                    {policy.musteriBilgileri.musteriAd}{" "}
                    {policy.musteriBilgileri.musteriSoyad}
                  </td>

                  <td>{calculateRemainingTime(policy.bitisTarihi)}</td>
                  <td>
                    <Link
                      to={`/odeme-sayfasi?id=${policy._id}&prim=${policy.prim}`}
                      className={styles.tableButton}
                    >
                      Ödeme Yap
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableSection}>
          <h2>İşleme Alınmış Teklifler</h2>
          <table>
            <thead>
              <tr>
                <th>Poliçe Türü</th>
                <th>Poliçe No</th>
                <th>Müşteri Adı</th>
                <th>Müşteri No</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {processedPolicies.map((policy) => (
                <tr key={policy._id}>
                  <td>{getProductTypeByBranchCode(policy.bransKodu)}</td>
                  <td>{policy.policeNo}</td>
                  <td>
                    {policy.musteriBilgileri.musteriAd}{" "}
                    {policy.musteriBilgileri.musteriSoyad}
                  </td>
                  <td>{policy.musteriBilgileri.musteriNo}</td>
                  <td>
                    <button
                      className={styles.tableButton}
                      onClick={() => generatePDF(policy)}
                    >
                      PDF Oluştur
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedPolicy && customerDetails && (
        <div
          className={
            isPdfHidden ? `${styles.pdfdiv} ${styles.hidden}` : styles.pdfdiv
          }
        >
          <PDFComponent
            ref={pdfContentRef}
            carInfo={carDetails}
            policyInfo={selectedPolicy}
            customerInfo={customerDetails}
            bransKodu={selectedPolicy.bransKodu}
          />
        </div>
      )}
    </div>
  );
}

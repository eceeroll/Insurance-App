import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";
import PDFComponent from "../PDFComponent/PDFComponent";
import axios from "axios";
import styles from "./SearchPolicy.module.css";
import { ProductCodes } from "../../productCodes";

export default function SearchPolicy() {
  const token = localStorage.getItem("token");
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState("");
  const [isPdfHidden, setIsPdfHidden] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const pdfContentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        "http://localhost:5000/api/policy/policeler",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPolicies(response.data);

      const customerResponse = await axios.get(
        "http://localhost:5000/api/customers/musteri-ara",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCustomers(customerResponse.data);

      setProductTypes(Object.values(ProductCodes));
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    let filtered = policies;

    if (searchTerm) {
      filtered = filtered.filter((policy) =>
        policy.policeNo.startsWith(searchTerm)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((policy) => policy.status === filterStatus);
    }

    if (selectedCustomer) {
      filtered = filtered.filter(
        (policy) => policy.musteriBilgileri.musteriNo === selectedCustomer
      );
    }

    if (selectedProductType) {
      filtered = filtered.filter(
        (policy) => policy.bransKodu === selectedProductType
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.tanzimTarihi);
      const dateB = new Date(b.tanzimTarihi);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredPolicies(filtered);
  }, [
    searchTerm,
    filterStatus,
    selectedCustomer,
    selectedProductType,
    sortOrder,
    policies,
  ]);

  const generatePDF = async (policy) => {
    setTimeout(() => {
      setIsPdfHidden(true);
    }, 100);

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
    }, 0); // Render işlemi tamamlanana kadar kısa bir gecikme ekler
  };

  const handleMakePayment = (policyId) => {
    // Ödeme yapma sayfasına yönlendirme
    console.log(`Ödeme yapma için poliçe ID: ${policyId}`);
  };

  return (
    <div className={styles.searchPolicy}>
      <h1 className={styles.title}>Poliçe Ara</h1>
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Poliçe No ile Ara"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="T">Teklif</option>
          <option value="K">Kayıt</option>
        </select>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">Müşteri Seçin</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.first_name} {customer.last_name}
            </option>
          ))}
        </select>
        <select
          value={selectedProductType}
          onChange={(e) => setSelectedProductType(e.target.value)}
        >
          <option value="">Ürün Türü Seçin</option>
          {productTypes.map((productType) => (
            <option key={productType.code} value={productType.code}>
              {productType.name}
            </option>
          ))}
        </select>
        <div className={styles.sortSelect}>
          <select
            className={styles.sortOrder}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Yeniden Eskiye</option>
            <option value="oldest">Eskiden Yeniye</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>Poliçe No</th>
              <th>Poliçe Türü</th>
              <th>Müşteri Adı</th>
              <th>Tanzim Tarihi</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredPolicies.map((policy) => (
              <tr key={policy._id}>
                <td>{policy.policeNo}</td>
                <td>
                  {
                    productTypes.find((type) => type.code === policy.bransKodu)
                      ?.name
                  }
                </td>
                <td>
                  {policy.musteriBilgileri.musteriAd}{" "}
                  {policy.musteriBilgileri.musteriSoyad}
                </td>
                <td>{new Date(policy.tanzimTarihi).toLocaleDateString()}</td>
                <td>{policy.status === "T" ? "Teklif" : "Kayıt"}</td>
                <td>
                  {policy.status === "K" && (
                    <button onClick={() => generatePDF(policy)}>
                      PDF Oluştur
                    </button>
                  )}
                  {policy.status === "T" && (
                    <button onClick={() => handleMakePayment(policy._id)}>
                      Ödeme Yap
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

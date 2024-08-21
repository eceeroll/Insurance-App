/* eslint-disable react/prop-types */
import React from "react";
import { getProductTypeByBranchCode } from "../../utils/getProductTypeByBranchCode";
import styles from "./PDFComponent.module.css";
import { formatDate } from "../../utils/formatDate";

const PDFComponent = React.forwardRef(
  ({ customerInfo, carInfo, policyInfo, buildingInfo, bransKodu }, ref) => {
    const policyTitle = getProductTypeByBranchCode(bransKodu);
    console.log("title:", policyTitle);

    return (
      <div ref={ref} className={styles.pdfContainer}>
        <div className={styles.header}>
          <h1>{policyTitle} Poliçesi</h1>
        </div>

        <div className={styles.subTitle}>Müşteri Bilgileri</div>
        <div className={styles.infoRow}>
          <div className={styles.infoField}>
            <span>Adı:</span> {customerInfo.first_name}
          </div>
          <div className={styles.infoField}>
            <span>Soyadı:</span> {customerInfo.last_name}
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoField}>
            <span>TC Kimlik Numarası:</span> {customerInfo.tc_no}
          </div>
          <div className={styles.infoField}>
            <span>Müşteri Numarası:</span> {customerInfo.musteri_no}
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoField}>
            <span>İl:</span> {customerInfo.province}
          </div>
          <div className={styles.infoField}>
            <span>İlçe:</span> {customerInfo.district}
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoField}>
            <span>Telefon Numarası:</span> {customerInfo.phone_number}
          </div>
          <div className={styles.infoField}>
            <span>Doğum Tarihi:</span> {formatDate(customerInfo.date_of_birth)}
          </div>
        </div>

        {/* kasko trafik için araç bilgileri göster */}
        {bransKodu === "310" || bransKodu === "340" ? (
          <>
            <div className={styles.subTitle}>Araç Bilgileri</div>
            <div className={styles.infoRow}>
              <div className={styles.infoField}>
                <span>Plaka İl Kodu:</span> {carInfo.plakaIlKodu}
              </div>
              <div className={styles.infoField}>
                <span>Plaka Kodu:</span> {carInfo.plakaKodu}
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoField}>
                <span>Marka:</span> {carInfo.aracMarka}
              </div>
              <div className={styles.infoField}>
                <span>Model:</span> {carInfo.aracModel}
              </div>
            </div>
            <div className={styles.infoField}>
              <span>Model Yılı:</span> {carInfo.aracModelYili}
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoField}>
                <span>Motor No:</span> {carInfo.motorNo}
              </div>
              <div className={styles.infoField}>
                <span>Şasi No:</span> {carInfo.sasiNo}
              </div>
            </div>
          </>
        ) : null}

        {/* dask için bina bilgileri göster */}
        {bransKodu === "199" ? (
          <>
            <div className={styles.subTitle}>Bina Bilgileri</div>
            <div className={styles.infoRow}>
              <div className={styles.infoField}>
                <span>UAVT Adres Kodu</span> {buildingInfo.uavtAdresKodu}
              </div>
              <div className={styles.infoField}>
                <span>Bina Metre Kare</span> {buildingInfo.binaMetreKare}
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoField}>
                <span>Bina Kat Sayısı</span> {buildingInfo.binaKat}
              </div>
              <div className={styles.infoField}>
                <span>Yapı Tarzı</span> {buildingInfo.yapiTarzi}
              </div>
            </div>
            <div className={styles.infoField}>
              <span>İnşa Yılı</span> {buildingInfo.insaYili}
            </div>
          </>
        ) : null}

        <div className={styles.subTitle}>Poliçe Bilgileri</div>
        <div className={styles.infoRow}>
          <div className={styles.infoField}>
            <span>Poliçe No:</span> {policyInfo.policeNo}
          </div>
          <div className={styles.infoField}>
            <span>Prim:</span> {policyInfo.prim} TL
          </div>
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoField}>
            <span>Tanzim Tarihi:</span> {formatDate(policyInfo.tanzimTarihi)}
          </div>
          <div className={styles.infoField}>
            <span>Başlangıç Tarihi:</span>{" "}
            {formatDate(policyInfo.baslangicTarihi)}
          </div>
        </div>
        <div className={styles.infoField}>
          <span>Bitiş Tarihi:</span> {formatDate(policyInfo.bitisTarihi)}
        </div>

        <div className={styles.footer}>
          Bu belge, poliçe bilgilerini içerir. Lütfen bilgilerin doğruluğunu
          kontrol edin.
        </div>
      </div>
    );
  }
);

// Display name for debugging purposes
PDFComponent.displayName = "PDFComponent";

export default PDFComponent;

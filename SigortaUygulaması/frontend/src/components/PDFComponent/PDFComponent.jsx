/* eslint-disable react/prop-types */
import React from "react";

import styles from "./PDFComponent.module.css";
import { formatDate } from "../../utils/formatDate";

const PDFComponent = React.forwardRef(
  ({ customerInfo, carInfo, policyInfo, bransKodu }, ref) => {
    return (
      <div ref={ref} className={styles.pdfContainer}>
        <div className={styles.header}>
          <h1>Poliçe Bilgileri</h1>
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
            <span>TC No:</span> {customerInfo.tc_no}
          </div>
          <div className={styles.infoField}>
            <span>Doğum Tarihi:</span> {formatDate(customerInfo.date_of_birth)}
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
        <div className={styles.infoField}>
          <span>Telefon Numarası:</span> {customerInfo.phone_number}
        </div>

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

        <div className={styles.subTitle}>Poliçe Bilgileri</div>
        <div className={styles.infoRow}>
          <div className={styles.infoField}>
            <span>Poliçe No:</span> {policyInfo.policeNo}
          </div>
          <div className={styles.infoField}>
            <span>Müşteri No:</span> {policyInfo.musteriBilgileri.musteriNo}
          </div>
        </div>
        <div className={styles.infoField}>
          <span>Prim:</span> {policyInfo.prim} TL
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

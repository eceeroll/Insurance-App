import styles from "./ChangePassword.module.css";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import BackButton from "../BackButton";

export default function ChangePassword() {
  const token = localStorage.getItem("token");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const handleSubmit = async (values) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/change-password`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Şifre Başarıyla Değiştirildi!");
        setTimeout(() => setSuccessMessage(""), 2000);
        setErrorMessage(""); // Clear error message on success
      }
    } catch (error) {
      // Handle errors from the API
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Şifre değiştirirken bir hata oluştu.");
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("Bu alan boş bırakılamaz"),
      newPassword: Yup.string()
        .min(8, "Parola en az 8 karakterden oluşmalıdır")
        .required("Bu alan boş bırakılamaz"),
      confirmPassword: Yup.string().oneOf(
        [Yup.ref("newPassword"), null],
        "Parolalar eşleşmiyor!"
      ),
    }),
    onSubmit: handleSubmit,
  });

  return (
    <div className={styles.changePasswordContainer}>
      <BackButton />
      <h1>Şifre Yenile</h1>
      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
      <form onSubmit={formik.handleSubmit}>
        <input
          type="password"
          name="oldPassword"
          placeholder="Eski Şifre"
          value={formik.values.oldPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={styles.input}
        />
        {formik.errors.oldPassword && formik.touched.oldPassword ? (
          <div className={styles.errorText}>{formik.errors.oldPassword}</div>
        ) : null}
        <input
          type="password"
          name="newPassword"
          placeholder="Yeni Şifre"
          value={formik.values.newPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={styles.input}
        />
        {formik.errors.newPassword && formik.touched.newPassword ? (
          <div className={styles.errorText}>{formik.errors.newPassword}</div>
        ) : null}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Yeni Şifre (Tekrar)"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={styles.input}
        />
        {formik.errors.confirmPassword && formik.touched.confirmPassword ? (
          <div className={styles.errorText}>
            {formik.errors.confirmPassword}
          </div>
        ) : null}
        <button type="submit" className={styles.changeButton}>
          Şifreyi Yenile
        </button>
      </form>
    </div>
  );
}

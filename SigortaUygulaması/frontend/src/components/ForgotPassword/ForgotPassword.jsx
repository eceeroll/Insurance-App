import styles from "./ForgotPassword.module.css";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [alert, setAlert] = useState({ message: "", type: "" });

  const ForgotPasswordSchema = Yup.object({
    email: Yup.string()
      .email("Geçerli bir email adresi giriniz.")
      .required("Bu alan boş bırakılamaz!"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/forgotPassword",
          values
        );
        console.log("Password reset link sent:", response.data);
        setAlert({ message: response.data.message, type: "success" });
      } catch (error) {
        console.error("Error sending password reset link:", error);
        setAlert({
          message: error.response?.data?.message || "Bir hata oluştu.",
          type: "danger",
        });
      }
    },
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Şifremi Unuttum</h2>

      {alert.message && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show`}
          role="alert"
        >
          {alert.message}
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email">
            <b>E-posta</b>
          </label>
          <input
            type="email"
            placeholder="E-posta"
            name="email"
            id="email"
            onBlur={formik.handleBlur}
            value={formik.values.email}
            onChange={formik.handleChange}
            className={
              formik.touched.email && formik.errors.email
                ? `form-control ${styles.errorInput}`
                : "form-control"
            }
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="form-text text-danger">{formik.errors.email}</div>
          ) : null}
        </div>

        <button className="forgotButton" type="submit">
          Şifre Sıfırlama Linki Gönder
        </button>

        <div className="mt-3">
          <Link to="/login" className="btn btn-secondary">
            Geri Dön
          </Link>
        </div>
      </form>
    </div>
  );
}

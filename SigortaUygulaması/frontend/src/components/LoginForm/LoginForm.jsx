import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import styles from "./LoginForm.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Bu alan boş bırakılamaz!"),
  password: Yup.string().required("Parola giriniz!"),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setErrorMessage("");
      setShowAlert(false);

      try {
        const response = await axios.post(
          "http://localhost:5000/api/login",
          values
        );
        if (response.status === 200) {
          console.log(response.data);
          const { token, firstName, lastName, role, id } = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("firstName", firstName);
          localStorage.setItem("lastName", lastName);
          localStorage.setItem(
            "user",
            JSON.stringify({ firstName, lastName, role, id })
          );

          if (role === "admin") {
            navigate("/admin", { state: { firstName, lastName } });
          } else if (role === "user") {
            navigate("/dashboard", { state: { firstName, lastName } });
          }
        }
      } catch (error) {
        console.error("Login error:", error.response);

        setErrorMessage(error.response?.data || "Bir hata oluştu.");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
      }
    },
    validateOnBlur: true, // Kullanıcı alanı terk ettiğinde doğrulama yapar
    validateOnChange: true, // Kullanıcı alanı değiştirdiğinde doğrulama yapar
  });

  return (
    <div className={styles.container}>
      <div className={styles["sub-container"]}>
        <h2 className={styles.title}>Giriş Yap</h2>
        {showAlert && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username">
              <b>Kullanıcı Adı</b>
            </label>
            <input
              type="text"
              placeholder="Kullanıcı adı"
              name="username"
              id="username"
              onBlur={formik.handleBlur}
              value={formik.values.username}
              onChange={formik.handleChange}
              className={
                formik.touched.username && formik.errors.username
                  ? `form-control ${styles.errorInput}`
                  : "form-control"
              }
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="form-text text-danger">
                {formik.errors.username}
              </div>
            ) : null}
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <b>Parola</b>
            </label>
            <input
              type="password"
              placeholder="Parola"
              name="password"
              id="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.password}
              className={
                formik.touched.password && formik.errors.password
                  ? `form-control ${styles.errorInput}`
                  : "form-control"
              }
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="form-text text-danger">
                {formik.errors.password}
              </div>
            ) : null}
          </div>
          <div className={styles["forgot-password"]}>
            <Link to="/forgotPassword">Şifremi Unuttum</Link>
          </div>
          <button className={styles.loginButton} type="submit">
            Giriş Yap
          </button>
        </form>
      </div>
      <div className={styles.direct}>
        <span>Üye değil misiniz? </span>
        <Link to="/register">Hemen kaydolun</Link>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import styles from "./LoginForm.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash, FaMoon, FaSun } from "react-icons/fa"; // Göz ve tema ikonları

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Bu alan boş bırakılamaz!"),
  password: Yup.string().required("Parola giriniz!"),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Şifre görünürlüğünü kontrol eden state
  const [darkMode, setDarkMode] = useState(false); // Dark mod kontrolü

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
          const { token, firstName, lastName, role, id, username } =
            response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("firstName", firstName);
          localStorage.setItem("lastName", lastName);
          localStorage.setItem("username", username);
          localStorage.setItem(
            "user",
            JSON.stringify({ firstName, lastName, role, id })
          );

          if (role === "admin") {
            navigate("/admin", { state: { firstName, lastName } });
          } else if (role === "user") {
            navigate("/dashboard");
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
    validateOnBlur: true,
    validateOnChange: true,
  });

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ""}`}>
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

          <div className="mb-3 position-relative">
            <label htmlFor="password">
              <b>Parola</b>
            </label>
            <input
              type={showPassword ? "text" : "password"}
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
            <div
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
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
      <div
        className={styles.themeSwitcher}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
        <span className={styles.switchText}>
          {darkMode ? "Light Tema" : "Dark Tema"}
        </span>
      </div>
    </div>
  );
}

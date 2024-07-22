import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./AddCustomer.module.css";
import { useNavigate } from "react-router-dom";

const AddCustomerSchema = Yup.object({
  tc_no: Yup.string()
    .length(11, "TC Kimlik Numarası 11 haneli olmalıdır.")
    .required("Bu alan boş bırakılamaz!"),
  birth_date: Yup.date().required("Bu alan boş bırakılamaz!"),
  first_name: Yup.string().required("Bu alan boş bırakılamaz!"),
  last_name: Yup.string().required("Bu alan boş bırakılamaz!"),
  province: Yup.string().required("Bu alan boş bırakılamaz!"),
  district: Yup.string().required("Bu alan boş bırakılamaz!"),
  phone_number: Yup.string()
    .matches(
      /^[1-9][0-9]{9}$/,
      "Lütfen telefon numaranızı başında 0 olmadan 10 haneli olarak giriniz."
    )
    .required("Bu alan boş bırakılamaz!"),
  email: Yup.string()
    .email("Geçersiz email adresi!")
    .required("Bu alan boş bırakılamaz!"),
});

export default function AddCustomer() {
  const formik = useFormik({
    initialValues: {
      tc_no: "",
      birth_date: "",
      first_name: "",
      last_name: "",
      province: "",
      district: "",
      phone_number: "",
      email: "",
    },
    validationSchema: AddCustomerSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate("/dashboard")}
      >
        Geri Dön
      </button>
      <form className={styles.addCustomerForm} onSubmit={formik.handleSubmit}>
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="tc_no">TC Kimlik Numarası</label>
            <input
              id="tc_no"
              name="tc_no"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.tc_no}
            />
            {formik.touched.tc_no && formik.errors.tc_no ? (
              <div className={styles.error}>{formik.errors.tc_no}</div>
            ) : null}
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="birth_date">Doğum Tarihi</label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.birth_date}
            />
            {formik.touched.birth_date && formik.errors.birth_date ? (
              <div className={styles.error}>{formik.errors.birth_date}</div>
            ) : null}
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="first_name">İsim</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.first_name}
            />
            {formik.touched.first_name && formik.errors.first_name ? (
              <div className={styles.error}>{formik.errors.first_name}</div>
            ) : null}
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="last_name">Soyisim</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.last_name}
            />
            {formik.touched.last_name && formik.errors.last_name ? (
              <div className={styles.error}>{formik.errors.last_name}</div>
            ) : null}
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="province">İl</label>
            <input
              id="province"
              name="province"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.province}
            />
            {formik.touched.province && formik.errors.province ? (
              <div className={styles.error}>{formik.errors.province}</div>
            ) : null}
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="district">İlçe</label>
            <input
              id="district"
              name="district"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.district}
            />
            {formik.touched.district && formik.errors.district ? (
              <div className={styles.error}>{formik.errors.district}</div>
            ) : null}
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="phone_number">Telefon Numarası</label>
            <input
              id="phone_number"
              name="phone_number"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone_number}
            />
            {formik.touched.phone_number && formik.errors.phone_number ? (
              <div className={styles.error}>{formik.errors.phone_number}</div>
            ) : null}
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className={styles.error}>{formik.errors.email}</div>
            ) : null}
          </div>
        </div>

        <button type="submit">Kaydet</button>
      </form>
    </div>
  );
}

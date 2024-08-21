import logo from "../assets/Screenshot_1.png";
import styles from "./logo.module.css";

const Logo = () => {
  return (
    <div className={styles["logo-container"]}>
      <img src={logo} alt="Ada Logo" className={styles.logo} />
    </div>
  );
};

export default Logo;

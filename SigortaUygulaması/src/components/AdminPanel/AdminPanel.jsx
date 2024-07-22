import { useLocation } from "react-router-dom";

export default function AdminPanel() {
  const location = useLocation();

  const { firstName, lastName } = location.state;
  return (
    <>
      <h1>Admin Paneli</h1>
      <h3>
        Hoşgeldiniz {firstName} {lastName}
      </h3>
    </>
  );
}

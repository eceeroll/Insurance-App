import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ManageUsers.module.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [adminCount, setAdminCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);

        const adminCount = users.filter((user) => user.role === "admin").length;
        setAdminCount(adminCount);
      } catch (error) {
        console.error("Kullanıcıları getirme işlemi başarısız oldu:", error);
      }
    };

    fetchUsers();
  }, [users, token]);

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      `${userId} id'li kullanıcı silinecektir. Devam etmek istiyor musunuz?`
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert("Kullanıcı başarıyla silindi.");
        setUsers(users.filter((user) => user._id !== userId));
      }
    } catch (error) {
      console.error("Kullanıcı silme işlemi başarısız oldu:", error);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleSave = async () => {
    try {
      // Sistemde sadece 1 tane admin olması durumu
      if (
        currentUser.id === selectedUser._id &&
        newRole === "user" &&
        adminCount <= 1
      ) {
        alert(
          "Sistemde en az 1 tane admin bulunmalıdır. Bu sebeple yetkinizi değiştiremezsiniz!"
        );
        return;
      }

      // Kullanıcının yetkisini değiştirmeden save basması durumu
      if (selectedUser.role === newRole) {
        alert(`Kullanıcı zaten ${newRole}`);
      }

      const response = await axios.put(
        `http://localhost:5000/admin/users/${selectedUser._id}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && selectedUser.role !== newRole) {
        alert("Kullanıcı başarıyla güncellendi.");
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? response.data : user
          )
        );

        // Eğer giriş yapan kullanıcı kendi yetkisini user olarak değiştirirse, çıkış yap ve giriş ekranına yönlendir
        if (currentUser.id === selectedUser._id && newRole === "user") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert(
            "Yetkiniz değiştirildiği için giriş yapma sayfasına yönlendiriliyorsunuz..."
          );
          navigate("/login");
        } else {
          setSelectedUser(null);
        }
      }
    } catch (error) {
      console.error("Kullanıcı güncelleme işlemi başarısız oldu:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Kullanıcı Yönetimi</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Kullanıcı Adı</th>
            <th>ID</th>
            <th>Yetki</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user._id}</td>
              <td>{user.role}</td>
              <td className={styles.actionButtons}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditUser(user)}
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className={styles.deleteButton}
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Kullanıcı Yetkisini Düzenle</h3>
            <p>
              <strong>Kullanıcı Adı:</strong> {selectedUser.username}
            </p>
            <p>
              <strong>ID:</strong> {selectedUser._id}
            </p>
            <label>
              Yeni Yetki:
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </label>
            <div className={styles.modalActions}>
              <button className={styles.saveButton} onClick={handleSave}>
                Kaydet
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setSelectedUser(null)}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

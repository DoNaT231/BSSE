import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import { tr } from 'date-fns/locale';
import { API_BASE_URL } from "../../config";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
 const token = localStorage.getItem('token');
 const [modal, setModal] = useState(false);
 const [modalMessage, setModalMessage] = useState("");
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/`, {
        headers: {
        "Authorization": `Bearer ${token}`}
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Hiba a felhasználók lekérésekor');
        }
        return response.json();
      })
      .then(data => setUsers(data))
      .catch(error => console.error(error));
  }, []);
  const deleteUser = (id) => {
    fetch(`${API_BASE_URL}/api/user/${id}`, {
        method: 'DELETE',
        headers:{Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"}
    })
    .then(async response => {
    const result = await response.text();
    if (!response.ok) {
      setModal(true);
        setModalMessage("Hiba a törlés során: " + result);
    } else {
      setModal(true);
        setModalMessage("Sikeres törlés: " + result);
    }
    })
    .catch(error => {
        setModal(true);
        setModalMessage("Hálózati hiba: " + error.message);
    });
  }
  return (
    <div className="user-list-container">
      <h2>Felhasználók</h2>
      <ul className="user-list">
        {users.map(user => (
          <li
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="user-list-item"
          >
            {user.username}
          </li>
        ))}
      </ul>

      {selectedUser && (
        <div className="user-details">
          <h3>Felhasználó adatai</h3>
          <p><strong>ID:</strong> {selectedUser.id}</p>
          <p><strong>Felhasználónév:</strong> {selectedUser.username}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Szerep:</strong> {selectedUser.user_type}</p>
          <div>
            <button onClick={() => setSelectedUser(null)}>Bezárás</button>
            <button onClick={() => deleteUser(selectedUser.id)}>Felhasználó törlése</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;

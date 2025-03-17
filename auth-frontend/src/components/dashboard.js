import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000"; // Backend URL

const Dashboard = ({ auth, setAuth }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${API_URL}/dashboard`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          alert("Session expired. Please log in again.");
          handleLogout();
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [auth, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    navigate("/login");
  };

  return (
    <div>
      <h2>Welcome, {user ? user.name : "Loading..."}</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
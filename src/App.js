import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import AdminDashboard from "./components/admin-dashboard/AdminDashboard";
import Login from "./components/login/Login"; // Ensure this path matches where your Login component is saved
import RoboFlow from "./components/roboflow/RoboFlow";
import UserDashboard from "./components/user-dashboard/UserDashboard";
import UserRegistrationForm from "./components/user-registration/UserRegistrationForm";
import { auth } from "./firebase-config";
import { fetchUserRole } from "./services/firebaseService";

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // State to store user role

  const theme = createTheme({
    /** Put your mantine theme override here */
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role once authenticated
        const role = await fetchUserRole(currentUser.uid);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null); // Reset user role if not logged in
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state upon logout
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <MantineProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            {/* Redirect users to UserDashboard if they are logged in, otherwise to the Login page */}
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/UserDashboard" replace />
                ) : (
                  <Navigate to="/Login" replace />
                )
              }
            />
            <Route path="/Login" element={<Login />} />
            <Route
              path="/UserDashboard"
              element={<UserDashboard handleLogout={handleLogout} />}
            />
            <Route path="/register" element={<UserRegistrationForm />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/roboflow" element={<RoboFlow />} />
          </Routes>
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;

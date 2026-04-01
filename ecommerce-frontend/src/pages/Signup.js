import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { api } from "../api";
import GoogleAuthButton from "../components/GoogleAuthButton";

function Signup({ setUser }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      await api.post("/register/", {
        username: email,
        email,
        password,
        full_name: name,
      });

      const loginResponse = await api.post("/login/", {
        email,
        password,
      });

      localStorage.setItem("token", loginResponse.data.access);
      localStorage.setItem("refreshToken", loginResponse.data.refresh);
      localStorage.setItem("user", JSON.stringify(loginResponse.data.user));

      if (setUser) {
        setUser(loginResponse.data.user);
      }

      navigate("/");
    } catch (err) {
      const backendErrors = err.response?.data;
      const firstError =
        typeof backendErrors === "string"
          ? backendErrors
          : Object.values(backendErrors || {})[0];

      setError(Array.isArray(firstError) ? firstError[0] : firstError || "Unable to create account.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)"
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "40px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}
      >

        <h3 className="text-center mb-4 fw-bold">Create Account</h3>

        <form onSubmit={handleSignup}>
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label>Full Name</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email address</label>
          </div>

          <div className="form-floating mb-3 position-relative">
            <input
              type={show ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label>Password</label>

            <span
              onClick={() => setShow(!show)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "14px",
                color: "#666"
              }}
            >
              {show ? "Hide" : "Show"}
            </span>
          </div>

          <button className="btn btn-success w-100 py-2 fw-semibold">
            Sign Up
          </button>

        </form>

        <GoogleAuthButton setUser={setUser} redirectPath="/" />

        <p className="text-center mt-3 small">
          Already have an account?{" "}
          <Link to="/login" style={{ textDecoration: "none" }}>
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;

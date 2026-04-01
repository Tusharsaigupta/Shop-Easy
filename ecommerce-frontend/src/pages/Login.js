import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "../api";
import GoogleAuthButton from "../components/GoogleAuthButton";

function Login({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/login/", {
        email,
        password,
      });

      localStorage.setItem("token", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (setUser) {
        setUser(data.user);
      }

      navigate(redirectPath);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid credentials. Please try again.",
      );
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "40px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h3 className="text-center mb-4 fw-bold">Welcome Back</h3>

        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
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
                color: "#666",
              }}
            >
              {show ? "Hide" : "Show"}
            </span>
          </div>

          <button className="btn btn-primary w-100 py-2 fw-semibold">
            Sign In
          </button>
        </form>

        <GoogleAuthButton setUser={setUser} redirectPath={redirectPath} />

        <p className="text-center mt-3 small">
          Don’t have an account?{" "}
          <Link to="/signup" style={{ textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

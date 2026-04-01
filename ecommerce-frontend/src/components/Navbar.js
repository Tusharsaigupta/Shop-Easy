import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useEffect } from "react";

function Navbar({ setSearch, setCategory, cart, user, setUser, setCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hideCategoryDropdownOnPaths = ["/cart", "/orders", "/checkout", "/payment", "/success"];
  const showCategoryDropdown = !hideCategoryDropdownOnPaths.includes(location.pathname);

  const totalItems = (cart || []).reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser && setUser(JSON.parse(storedUser));
      }
    }
  }, [user, setUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser && setUser(null);
    setCart && setCart([]);
    navigate("/");
  };

  return (
    <nav
      className="navbar app-navbar"
      style={{
        background: "linear-gradient(90deg, #141e30, #243b55)",
      }}
    >
      <div className="app-navbar-inner">
        <div className="app-navbar-left">
          <Link
            className="navbar-brand fw-bold text-white mb-0"
            to="/"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            🛍 SHOP EASY
          </Link>

          {showCategoryDropdown && (
            <div className="nav-item dropdown app-category-dropdown">
              <span
                className="nav-link dropdown-toggle text-white"
                role="button"
                data-bs-toggle="dropdown"
              >
                Categories
              </span>

              <ul className="dropdown-menu">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setCategory("")}
                  >
                    All
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setCategory("electronics")}
                  >
                    Electronics
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setCategory("fashion")}
                  >
                    Fashion
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setCategory("home")}
                  >
                    Home Appliances
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="app-navbar-search">
          <div className="app-search-wrap">
            <span className="app-search-icon">🔍</span>
            <input
              className="form-control app-search-input"
              placeholder="Search..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="app-navbar-right">
          <Link
            to="/cart"
            className="position-relative text-decoration-none app-cart-link"
          >
            <FaShoppingCart size={22} color="white" />

            {totalItems > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-10px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "12px",
                  padding: "2px 6px",
                  fontWeight: "bold",
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="dropdown app-user-dropdown">
              <button
                className="btn d-flex align-items-center gap-2 dropdown-toggle text-white border-0 app-user-trigger"
                data-bs-toggle="dropdown"
                style={{ background: "transparent" }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: user.profilePic
                      ? "transparent"
                      : "linear-gradient(135deg, #667eea, #764ba2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "bold",
                    overflow: "hidden",
                  }}
                >
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    user.email?.charAt(0).toUpperCase()
                  )}
                </div>

                <span className="fw-semibold d-none d-md-block">
                  {user.fullName || user.name || "User"}
                </span>
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    👤 My Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/orders">
                    📦 My Orders
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/cart">
                    🛒 My Cart
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="app-auth-actions">
              <Link className="btn btn-light" to="/login">
                Login
              </Link>
              <Link className="btn btn-danger" to="/signup">
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

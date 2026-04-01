import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Success({ setCart }) {
  const navigate = useNavigate();
  const { state } = useLocation();

  const orderId = state?.orderId;
  const total = state?.total;
  const paymentMethod = state?.paymentMethod;

  // ✅ EXTRA SAFETY: clear cart here also
  useEffect(() => {
    if (setCart) {
      setCart([]);
    }
    localStorage.removeItem("cart");
  }, [setCart]);

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div
        className="bg-white p-5 rounded-4 shadow-lg text-center"
        style={{
          maxWidth: "500px",
          width: "100%",
          border: "1px solid #eee",
        }}
      >
        {/* SUCCESS ICON */}
        <div
          className="mx-auto mb-4 d-flex justify-content-center align-items-center"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #28a745, #5dd39e)",
            color: "#fff",
            fontSize: "36px",
            boxShadow: "0 6px 20px rgba(40,167,69,0.3)",
          }}
        >
          ✓
        </div>

        {/* TITLE */}
        <h2 className="fw-bold text-success mb-2">
          Order Placed Successfully
        </h2>

        {/* MESSAGE */}
        <p className="text-muted mb-4">
          Your order is confirmed and we are getting it ready for dispatch.
        </p>

        {(orderId || total || paymentMethod) && (
          <div
            className="text-start rounded-4 p-3 mb-4"
            style={{ background: "#f8f9fa", border: "1px solid #eee" }}
          >
            {orderId && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Order ID</span>
                <span className="fw-semibold">#{orderId}</span>
              </div>
            )}
            {total && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Total Paid</span>
                <span className="fw-semibold">${total}</span>
              </div>
            )}
            {paymentMethod && (
              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment</span>
                <span className="fw-semibold text-uppercase">{paymentMethod}</span>
              </div>
            )}
          </div>
        )}

        {/* BUTTONS */}
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button
            className="btn btn-success px-4 fw-semibold"
            style={{ borderRadius: "25px" }}
            onClick={() => navigate("/orders")}
          >
            📦 View Orders
          </button>

          <button
            className="btn btn-outline-dark px-4 fw-semibold"
            style={{ borderRadius: "25px" }}
            onClick={() => navigate("/")}
          >
            🛍 Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api, getAuthHeaders } from "../api";

function Payment({ setCart }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  if (!state) return <h3 className="text-center mt-5">Invalid Access</h3>;

  const { total, cart, form } = state;

  const handlePayment = async () => {
    if (form.payment === "upi" && !upi) {
      alert("Enter UPI ID");
      return;
    }

    if (form.payment === "card") {
      if (!card.number || !card.name || !card.expiry || !card.cvv) {
        alert("Fill all card details");
        return;
      }
    }

    setLoading(true);

    try {
      await api.post(
        "/orders/",
        {
          items: cart.map((item) => ({
            product: item.id,
            quantity: item.quantity,
          })),
          address: form,
          payment: form.payment,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        },
      );

      if (setCart) {
        setCart([]);
      }

      localStorage.setItem("cart", JSON.stringify([]));
      navigate("/success");
    } catch (error) {
      console.error("Payment order creation failed:", error);
      alert("Payment could not be completed right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">

        <div className="col-md-6">
          <div className="bg-white p-4 rounded shadow-lg">

            <h4 className="fw-bold mb-3 text-center">💳 Secure Payment</h4>

            <h5 className="text-center text-success mb-4">
              Pay ${total.toFixed(2)}
            </h5>

            {/* UPI */}
            {form.payment === "upi" && (
              <input
                className="form-control mb-3"
                placeholder="Enter UPI ID (example@upi)"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
              />
            )}

            {/* CARD */}
            {form.payment === "card" && (
              <>
                <input
                  className="form-control mb-2"
                  placeholder="Card Number"
                  value={card.number}
                  onChange={(e) =>
                    setCard({ ...card, number: e.target.value })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Card Holder Name"
                  value={card.name}
                  onChange={(e) =>
                    setCard({ ...card, name: e.target.value })
                  }
                />

                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) =>
                      setCard({ ...card, expiry: e.target.value })
                    }
                  />

                  <input
                    className="form-control"
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={(e) =>
                      setCard({ ...card, cvv: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <button
              className="btn btn-success w-100 mt-4"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>

            <button
              className="btn btn-outline-danger w-100 mt-2"
              onClick={() => navigate("/checkout")}
            >
              Cancel
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;

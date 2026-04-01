import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Cart({ cart, increaseQty, decreaseQty, removeItem }) {

  const navigate = useNavigate();

  // 🧮 TOTAL CALCULATIONS
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const deliveryCharge = total === 0 ? 0 : total > 50 ? 0 : 5;
  const discount = total > 100 ? 10 : 0;
  const tax = total * 0.18;

  const finalTotal = total + deliveryCharge + tax - discount;

  return (
    <div className="container py-5">

      <h2 className="mb-4 fw-bold text-dark">🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="text-center mt-5">
          <h5 className="text-muted">Your cart is empty 😢</h5>
        </div>
      ) : (
        <div className="row">

          {/* LEFT SIDE - CART ITEMS */}
          <div className="col-lg-8">

            {cart.map((item) => (
              <div
                key={item.id}
                className="mb-3 p-3 rounded d-flex align-items-center"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
                }}
              >

                {/* IMAGE */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "90px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />

                {/* DETAILS */}
                <div className="ms-3 flex-grow-1">
                  <h6 className="mb-1 text-dark">{item.name}</h6>
                  <small className="text-muted">${item.price}</small>

                  {/* QUANTITY CONTROLS */}
                  <div className="mt-2 d-flex align-items-center">

                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => decreaseQty(item.id)}
                    >
                      −
                    </button>

                    <span className="mx-3 fw-semibold">
                      {item.quantity}
                    </span>

                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => {
                        const increased = increaseQty(item.id);
                        if (!increased) {
                          Swal.fire({
                            icon: "warning",
                            title: "Stock Limit Reached",
                            text: "You cannot add more of this product.",
                            showConfirmButton: false,
                            timer: 1500,
                            toast: true,
                            position: "top-end",
                          });
                        }
                      }}
                    >
                      +
                    </button>

                  </div>
                </div>

                {/* REMOVE BUTTON */}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>

              </div>
            ))}

          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <div className="col-lg-4">

            <div
              className="p-4 rounded"
              style={{
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
              }}
            >

              <h5 className="mb-3 text-dark">Price Details</h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">
                  Price ({totalItems} items)
                </span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Discount</span>
                <span className="text-success">
                  -${discount}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Delivery Charges</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    `$${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax (18%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <strong>Total Amount</strong>
                <strong>${finalTotal.toFixed(2)}</strong>
              </div>

              {/* ✅ CHECKOUT BUTTON */}
              <button
                className="btn btn-dark w-100 fw-semibold"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default Cart;

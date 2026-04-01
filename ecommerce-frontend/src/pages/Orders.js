import { useEffect, useState } from "react";
import { api, getAuthHeaders } from "../api";

function Orders() {
  const [orders, setOrders] = useState([]);

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/my-orders/", {
        headers: getAuthHeaders(),
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to fetch orders:", error);
      setOrders([]);
    }
  };

  fetchOrders();
}, []);

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center mt-5">
        <h3 className="fw-bold">No Orders Yet</h3>
        <p className="text-muted">
          Your orders will appear here after purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      
      <h2 className="mb-4 fw-bold text-center">🧾 My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="card mb-4 border-0 shadow-sm"
          style={{
            borderRadius: "14px",
            overflow: "hidden"
          }}
        >
          {/* HEADER */}
          <div
            className="px-4 py-3 d-flex justify-content-between align-items-center"
            style={{
              background: "#f8f9fa",
              borderBottom: "1px solid #eee"
            }}
          >
            <div>
              <div className="small text-muted">Order ID</div>
              <div className="fw-semibold">{order.id}</div>
            </div>

            <div className="text-end">
              <div className="small text-muted">Placed On</div>
              <div className="fw-semibold small">
                {order.date
                  ? new Date(order.date).toLocaleString()
                  : "Date not available"}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="card-body px-4 py-3">
            
            {order.items && Array.isArray(order.items) ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center justify-content-between py-2"
                  style={{
                    borderBottom: "1px solid #f1f1f1"
                  }}
                >
                  {/* LEFT SIDE */}
                  <div className="d-flex align-items-center gap-3">
                    
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "65px",
                        height: "65px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #eee"
                      }}
                    />

                    <div>
                      <div className="fw-semibold">
                        {item.name}
                      </div>
                      <div className="text-muted small">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="fw-semibold">
                    ${item.price * item.quantity}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No items found</p>
            )}

            {/* TOTAL */}
            <div className="mt-3 d-flex justify-content-between align-items-center">
              <span className="text-muted fw-semibold">
                Order Total
              </span>
              <span className="fw-bold fs-5">
                ${order.total || 0}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;

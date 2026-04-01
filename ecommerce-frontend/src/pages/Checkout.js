import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getAuthHeaders } from "../api";

const EMPTY_FORM = {
  fullName: "",
  house: "",
  area: "",
  district: "",
  state: "",
  pincode: "",
  country: "India",
  phoneCode: "+91",
  phone: "",
  addressType: "",
  payment: "cod",
};

function Checkout({ cart, setCart }) {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = useMemo(
    () => (storedUser ? JSON.parse(storedUser) : null),
    [storedUser],
  );

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=checkout");
    }
  }, [user, navigate]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressMode, setAddressMode] = useState("new");
  const [saveAddress, setSaveAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = total * 0.18;
  const delivery = total === 0 ? 0 : total > 50 ? 0 : 5;
  const discount = total > 200 ? 20 : 0;
  const finalTotal = total + tax + delivery - discount;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        return;
      }

      try {
        const { data } = await api.get("/addresses/", {
          headers: getAuthHeaders(),
        });

        const addressList = Array.isArray(data) ? data : [];
        setSavedAddresses(addressList);

        if (addressList.length > 0) {
          const defaultAddress = addressList.find((address) => address.isDefault) || addressList[0];
          setSelectedAddressId(defaultAddress.id);
          setAddressMode("saved");
        }
      } catch (error) {
        console.error("Unable to fetch saved addresses:", error);
        setSavedAddresses([]);
        setAddressMode("new");
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const validateAddress = () => {
    let newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Required";
    if (!form.house.trim()) newErrors.house = "Required";
    if (!form.area.trim()) newErrors.area = "Required";
    if (!form.district.trim()) newErrors.district = "Required";
    if (!form.state.trim()) newErrors.state = "Required";

    if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Invalid pincode";

    if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Invalid phone";

    if (!form.addressType) newErrors.addressType = "Select type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (addressMode === "saved") {
      if (selectedAddressId) {
        setStep(2);
      } else {
        setErrors({ address: "Select a saved address or add a new one." });
      }
      return;
    }

    if (validateAddress()) setStep(2);
  };

  const placeOrder = async () => {
    try {
      setSubmitting(true);

      const response = await api.post(
        "/orders/",
        addressMode === "saved"
          ? {
              items: cart.map((item) => ({
                product: item.id,
                quantity: item.quantity,
              })),
              address_id: selectedAddressId,
              payment: form.payment,
            }
          : {
              items: cart.map((item) => ({
                product: item.id,
                quantity: item.quantity,
              })),
              address: form,
              payment: form.payment,
              save_address: saveAddress,
            },
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        },
      );

      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      navigate("/success", {
        state: {
          orderId: response.data.id,
          total: response.data.total,
          paymentMethod: response.data.paymentMethod,
        },
      });
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Unable to place order right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "1100px" }}>
      {/* STEP INDICATOR */}
      <div className="d-flex justify-content-center mb-4">
        <div className="d-flex gap-5 fs-5">
          <span className={step === 1 ? "fw-bold text-primary" : "text-muted"}>
            📍 Address
          </span>
          <span className={step === 2 ? "fw-bold text-primary" : "text-muted"}>
            💳 Payment
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT SIDE */}
        <div className="col-lg-7">
          {/* ADDRESS FORM */}
          {step === 1 && (
            <div className="card border-0 shadow-sm p-4 rounded-4">
              <h5 className="fw-bold mb-3">Delivery Address</h5>

              {!loadingAddresses && savedAddresses.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-semibold">Saved Addresses</div>
                    <button
                      type="button"
                      className={`btn btn-sm ${addressMode === "new" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => {
                        setAddressMode("new");
                        setSelectedAddressId(null);
                        setErrors({});
                      }}
                    >
                      Add New Address
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={`border rounded-3 p-3 ${addressMode === "saved" && selectedAddressId === address.id ? "border-primary" : ""}`}
                        style={{ cursor: "pointer", background: "#fff" }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="d-flex gap-2">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={addressMode === "saved" && selectedAddressId === address.id}
                              onChange={() => {
                                setAddressMode("saved");
                                setSelectedAddressId(address.id);
                                setErrors({});
                              }}
                            />
                            <div>
                              <div className="fw-semibold">
                                {address.fullName} {address.isDefault && <span className="badge text-bg-success ms-2">Default</span>}
                              </div>
                              <div className="text-muted small">
                                {address.line1}
                                {address.line2 ? `, ${address.line2}` : ""}
                                {address.landmark ? `, ${address.landmark}` : ""}
                              </div>
                              <div className="text-muted small">
                                {address.city}, {address.state} {address.postalCode}
                              </div>
                              <div className="text-muted small">
                                {address.phone} • {String(address.addressType || "").toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {errors.address && (
                    <small className="text-danger d-block mt-2">{errors.address}</small>
                  )}
                </div>
              )}

              {addressMode === "saved" && selectedAddressId ? (
                <div className="border rounded-3 p-3 bg-light">
                  <div className="fw-semibold mb-1">Selected delivery address</div>
                  {savedAddresses
                    .filter((address) => address.id === selectedAddressId)
                    .map((address) => (
                      <div key={address.id} className="text-muted small">
                        <div>{address.fullName}</div>
                        <div>
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""}
                          {address.landmark ? `, ${address.landmark}` : ""}
                        </div>
                        <div>
                          {address.city}, {address.state} {address.postalCode}
                        </div>
                        <div>{address.phone}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    <input
                      className={`form-control ${errors.fullName && "is-invalid"}`}
                      placeholder="Full Name"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                    />
                    <small className="text-danger">{errors.fullName}</small>
                  </div>

                  <div className="mb-2">
                    <input
                      className={`form-control ${errors.house && "is-invalid"}`}
                      placeholder="House / Flat"
                      name="house"
                      value={form.house}
                      onChange={handleChange}
                    />
                    <small className="text-danger">{errors.house}</small>
                  </div>

                  <div className="mb-2">
                    <input
                      className={`form-control ${errors.area && "is-invalid"}`}
                      placeholder="Area / Street"
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                    />
                    <small className="text-danger">{errors.area}</small>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <input
                        className={`form-control ${errors.district && "is-invalid"}`}
                        placeholder="City"
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                      />
                      <small className="text-danger">{errors.district}</small>
                    </div>

                    <div className="col-md-6 mb-2">
                      <input
                        className={`form-control ${errors.state && "is-invalid"}`}
                        placeholder="State"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                      />
                      <small className="text-danger">{errors.state}</small>
                    </div>
                  </div>

                  <input
                    className={`form-control mb-2 ${errors.pincode && "is-invalid"}`}
                    placeholder="Pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                  />
                  <small className="text-danger">{errors.pincode}</small>

                  <div className="d-flex gap-2 mt-2">
                    <select
                      className="form-select"
                      style={{ maxWidth: "120px" }}
                      name="phoneCode"
                      value={form.phoneCode}
                      onChange={handleChange}
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>

                    <input
                      className={`form-control ${errors.phone && "is-invalid"}`}
                      placeholder="Phone Number"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <small className="text-danger">{errors.phone}</small>

                  <div className="mt-3">
                    <div className="fw-semibold">Address Type</div>
                    <div className="d-flex gap-3 mt-2">
                      {["Home", "Work"].map((type) => (
                        <label key={type}>
                          <input
                            type="radio"
                            name="addressType"
                            value={type}
                            checked={form.addressType === type}
                            onChange={handleChange}
                          />{" "}
                          {type}
                        </label>
                      ))}
                    </div>
                    <small className="text-danger">{errors.addressType}</small>
                  </div>

                  <div className="form-check mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAddress}
                      onChange={(event) => setSaveAddress(event.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="saveAddress">
                      Save this address for future orders
                    </label>
                  </div>
                </>
              )}

              {savedAddresses.length > 0 && addressMode === "saved" && (
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 mt-3"
                  onClick={() => {
                    setAddressMode("new");
                    setSelectedAddressId(null);
                    setForm(EMPTY_FORM);
                  }}
                >
                  Use a Different Address
                </button>
              )}

              {savedAddresses.length === 0 && !loadingAddresses && (
                <div className="text-muted small mb-3">
                  You do not have a saved address yet. Add one below and we can save it for next time.
                </div>
              )}

              <button
                className="btn btn-primary w-100 mt-4"
                onClick={handleNext}
              >
                Continue →
              </button>
            </div>
          )}

          {/* PAYMENT */}
          {step === 2 && (
            <div className="card border-0 shadow-sm p-4 rounded-4">
              <h5 className="fw-bold mb-3">Payment Method</h5>

              {["cod", "upi", "card"].map((m) => (
                <label key={m} className="border p-3 rounded mb-2 d-block">
                  <input
                    type="radio"
                    name="payment"
                    value={m}
                    checked={form.payment === m}
                    onChange={handleChange}
                  />{" "}
                  {m.toUpperCase()}
                </label>
              ))}

              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-outline-secondary w-50"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>

                <button
                  className="btn btn-success w-50"
                  onClick={placeOrder}
                  disabled={submitting}
                >
                  {submitting ? "Placing..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE (ORDER SUMMARY) */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-3">Order Summary</h5>

            {cart.map((item) => (
              <div
                key={item.id}
                className="d-flex justify-content-between mb-2"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${item.price * item.quantity}</span>
              </div>
            ))}

            <hr />

            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>Delivery</span>
              <span>{delivery === 0 ? "FREE" : `$${delivery}`}</span>
            </div>

            <div className="d-flex justify-content-between text-success">
              <span>Discount</span>
              <span>-${discount}</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

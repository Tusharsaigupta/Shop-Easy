import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { api, getAuthHeaders } from "../api";

const EMPTY_ADDRESS_FORM = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressType: "home",
  isDefault: false,
};

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [addressEditId, setAddressEditId] = useState(null);
  const [addressBusy, setAddressBusy] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    image: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [{ data: profileData }, { data: addressData }] = await Promise.all([
          api.get("/profile/", {
            headers: getAuthHeaders(),
          }),
          api.get("/addresses/", {
            headers: getAuthHeaders(),
          }),
        ]);

        setUser(profileData);
        setForm({
          name: profileData.fullName || "",
          phone: profileData.phone || "",
          image: profileData.profilePic || ""
        });
        setSavedAddresses(Array.isArray(addressData) ? addressData : []);
        localStorage.setItem("user", JSON.stringify(profileData));
      } catch (error) {
        console.error("Unable to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await api.patch(
        "/profile/",
        {
          fullName: form.name,
          phone: form.phone,
          profilePic: form.image,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        },
      );

      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("user-profile-updated", {
        detail: data,
      }));
      setUser(data);
      setEditMode(false);
    } catch (error) {
      console.error("Unable to save profile:", error);
      alert("Unable to save profile right now.");
    }
  };

  const resetAddressForm = () => {
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressEditId(null);
  };

  const handleAddressFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setAddressBusy(true);
    const isEditing = Boolean(addressEditId);

    try {
      const requestConfig = {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      };

      const response = addressEditId
        ? await api.patch(`/addresses/${addressEditId}/`, addressForm, requestConfig)
        : await api.post("/addresses/", addressForm, requestConfig);

      let nextAddresses;
      if (addressEditId) {
        nextAddresses = savedAddresses.map((address) =>
          address.id === addressEditId ? response.data : address,
        );
      } else {
        nextAddresses = [response.data, ...savedAddresses];
      }

      nextAddresses = nextAddresses
        .map((address) => ({
          ...address,
          isDefault:
            response.data.isDefault && address.id !== response.data.id
              ? false
              : address.isDefault,
        }))
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

      setSavedAddresses(nextAddresses);
      resetAddressForm();
      await Swal.fire({
        icon: "success",
        title: isEditing ? "Address Updated" : "Address Saved",
        text: isEditing
          ? "Your address has been updated successfully."
          : "Your address has been saved successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Unable to save address:", error);
      await Swal.fire({
        icon: "error",
        title: "Address Not Saved",
        text: "Unable to save address right now. Please try again.",
      });
    } finally {
      setAddressBusy(false);
    }
  };

  const handleAddressEdit = (address) => {
    setAddressEditId(address.id);
    setAddressForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      addressType: address.addressType || "home",
      isDefault: Boolean(address.isDefault),
    });
  };

  const handleAddressDelete = async (addressId) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete Address?",
      text: "This saved address will be removed from your profile.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/addresses/${addressId}/`, {
        headers: getAuthHeaders(),
      });

      const nextAddresses = savedAddresses.filter((address) => address.id !== addressId);
      setSavedAddresses(nextAddresses);
      if (addressEditId === addressId) {
        resetAddressForm();
      }
      await Swal.fire({
        icon: "success",
        title: "Address Deleted",
        text: "The saved address has been removed.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Unable to delete address:", error);
      await Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Unable to delete address right now. Please try again.",
      });
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const { data } = await api.patch(
        `/addresses/${addressId}/`,
        { isDefault: true },
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        },
      );

      setSavedAddresses((prev) =>
        prev
          .map((address) => ({
            ...address,
            isDefault: address.id === data.id,
          }))
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
      );
      await Swal.fire({
        icon: "success",
        title: "Default Address Updated",
        text: "This address will now be used first during checkout.",
        timer: 1700,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Unable to update default address:", error);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Unable to update default address right now. Please try again.",
      });
    }
  };

  if (!user) return <h3 className="text-center mt-5">User not found</h3>;

  return (
    <div
      className="container py-5"
      style={{ maxWidth: "950px" }}
    >
      <div
        className="p-4 mb-4 rounded-4 text-white"
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)"
        }}
      >
        <h2 className="fw-bold mb-0">My Profile</h2>
        <p className="mb-0 opacity-75">
          Manage your personal information
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-4 p-4">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <div className="position-relative">
            <img
              src={
                form.image ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid white",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
              }}
            />

            {editMode && (
              <>
                <label
                  htmlFor="upload"
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    background: "#0d6efd",
                    color: "white",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                  }}
                >
                  📷
                </label>

                <input
                  id="upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </>
            )}
          </div>

          <div>
            <h4 className="fw-bold mb-1">{user.fullName || "User"}</h4>
            <p className="text-muted mb-0">{user.email}</p>
          </div>

          <div className="ms-auto">
            {!editMode && (
              <button
                className="btn btn-primary px-4"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <hr />

        <div className="row g-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Full Name</label>
            {editMode ? (
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            ) : (
              <div className="form-control bg-light">
                {user.fullName || "Not provided"}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Email</label>
            <div className="form-control bg-light">
              {user.email}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Phone</label>
            {editMode ? (
              <input
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            ) : (
              <div className="form-control bg-light">
                {user.phone || "Not provided"}
              </div>
            )}
          </div>

        </div>

        {editMode && (
          <div className="d-flex justify-content-end gap-3 mt-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-success px-4"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-4 p-4 mt-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div>
            <h4 className="fw-bold mb-1">Saved Addresses</h4>
            <p className="text-muted mb-0">
              Choose these during checkout instead of typing the address again.
            </p>
          </div>
          {addressEditId && (
            <button
              className="btn btn-outline-secondary"
              onClick={resetAddressForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            {savedAddresses.length === 0 ? (
              <div className="border rounded-4 p-4 bg-light text-muted">
                No saved addresses yet.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {savedAddresses.map((address) => (
                  <div key={address.id} className="border rounded-4 p-3">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                      <div>
                        <div className="fw-semibold">
                          {address.fullName}
                          {address.isDefault && (
                            <span className="badge text-bg-success ms-2">Default</span>
                          )}
                        </div>
                        <div className="text-muted small mt-1">
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

                      <div className="d-flex gap-2 flex-wrap">
                        {!address.isDefault && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleSetDefaultAddress(address.id)}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleAddressEdit(address)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleAddressDelete(address.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-lg-5">
            <form className="border rounded-4 p-4 bg-light" onSubmit={handleAddressSubmit}>
              <h5 className="fw-bold mb-3">
                {addressEditId ? "Edit Address" : "Add New Address"}
              </h5>

              <input
                className="form-control mb-2"
                name="fullName"
                placeholder="Full Name"
                value={addressForm.fullName}
                onChange={handleAddressFormChange}
                required
              />
              <input
                className="form-control mb-2"
                name="phone"
                placeholder="Phone"
                value={addressForm.phone}
                onChange={handleAddressFormChange}
                required
              />
              <input
                className="form-control mb-2"
                name="line1"
                placeholder="Address Line 1"
                value={addressForm.line1}
                onChange={handleAddressFormChange}
                required
              />
              <input
                className="form-control mb-2"
                name="line2"
                placeholder="Address Line 2"
                value={addressForm.line2}
                onChange={handleAddressFormChange}
              />
              <input
                className="form-control mb-2"
                name="landmark"
                placeholder="Landmark"
                value={addressForm.landmark}
                onChange={handleAddressFormChange}
              />

              <div className="row">
                <div className="col-md-6 mb-2">
                  <input
                    className="form-control"
                    name="city"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={handleAddressFormChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <input
                    className="form-control"
                    name="state"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={handleAddressFormChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-2">
                  <input
                    className="form-control"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={addressForm.postalCode}
                    onChange={handleAddressFormChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <input
                    className="form-control"
                    name="country"
                    placeholder="Country"
                    value={addressForm.country}
                    onChange={handleAddressFormChange}
                    required
                  />
                </div>
              </div>

              <select
                className="form-select mb-3"
                name="addressType"
                value={addressForm.addressType}
                onChange={handleAddressFormChange}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isDefaultAddress"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleAddressFormChange}
                />
                <label className="form-check-label" htmlFor="isDefaultAddress">
                  Make this my default address
                </label>
              </div>

              <button className="btn btn-primary w-100" type="submit" disabled={addressBusy}>
                {addressBusy ? "Saving..." : addressEditId ? "Update Address" : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

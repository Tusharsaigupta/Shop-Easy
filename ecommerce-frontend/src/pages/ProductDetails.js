import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useMemo } from "react";

function ProductDetails({
  products,
  cart,
  addToCart,
  increaseQty,
  decreaseQty,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((item) => item.id === parseInt(id));
  const images = useMemo(() => {
    if (product?.images?.length > 0) {
      return product.images.map((img) => img.image);
    }
    return product?.image ? [product.image] : [];
  }, [product]);

  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
  if (images.length > 0) {
    setMainImage(images[0]);
  }
}, [images]);

  if (!product) {
    return <h2 className="text-center mt-5">Product not found</h2>;
  }

  const isOutOfStock = product.stock <= 0;
  const cartItem = cart.find((item) => item.id === product.id);

  const handleAdd = () => {
    const added = addToCart(product);
    Swal.fire({
      icon: added ? "success" : "warning",
      title: added ? "Added to Cart" : "Stock Limit Reached",
      text: added ? product.name : "You cannot add more of this product.",
      showConfirmButton: false,
      timer: 1800,
      toast: true,
      position: "top-end",
    });
  };

  const handleIncrease = () => {
    const increased = increaseQty(product.id);
    if (!increased) {
      Swal.fire({
        icon: "warning",
        title: "Stock Limit Reached",
        text: "You cannot add more of this product.",
        showConfirmButton: false,
        timer: 1800,
        toast: true,
        position: "top-end",
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-5 align-items-start">
        {/* IMAGE SECTION */}
        <div className="col-lg-6">
          <div className="bg-white p-3 rounded-4 shadow-sm text-center">
            <img
              src={mainImage}
              alt={product.name}
              className="img-fluid rounded-3"
              style={{
                maxHeight: "450px",
                objectFit: "contain",
                transition: "0.3s ease",
              }}
            />
          </div>

          {/* Thumbnails */}
          <div className="d-flex gap-2 mt-3 justify-content-center flex-wrap">
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => setMainImage(img)}
                style={{
                  border:
                    mainImage === img ? "2px solid #0d6efd" : "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "3px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={img}
                  alt="thumb"
                  style={{
                    width: "65px",
                    height: "65px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="col-lg-6">
          <div className="bg-white p-4 rounded-4 shadow-sm">
            <h3 className="fw-bold mb-2">{product.name}</h3>

            {/* Rating */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="text-warning">
                {"⭐".repeat(Math.floor(product.rating || 4))}
              </span>
              <span className="text-muted small">
                ({product.rating || 4.2})
              </span>
            </div>

            {/* Price */}
            <h2 className="text-success fw-bold mb-3">${product.price}</h2>
            {isOutOfStock && (
              <div className="fw-semibold mb-3 text-danger">Out of stock</div>
            )}

            {/* Description */}
            <p className="text-muted">{product.description}</p>

            {/* HIGHLIGHTS */}
            {product.meta?.highlights && (
              <div className="mt-3">
                <h6 className="fw-bold">Highlights</h6>
                <ul className="text-muted">
                  {product.meta.highlights.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SPECIFICATIONS */}
            {product.meta?.specifications && (
              <div className="mt-3">
                <h6 className="fw-bold">Specifications</h6>
                <table className="table table-sm">
                  <tbody>
                    {Object.entries(product.meta.specifications).map(
                      ([key, value]) => (
                        <tr key={key}>
                          <td className="text-muted">{key}</td>
                          <td>{value}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* BUTTONS */}
            <div className="d-flex gap-3 mt-4">
              {cartItem ? (
                <div className="d-flex align-items-center justify-content-between w-100 gap-3">
                  <button
                    className="btn btn-outline-dark fw-semibold shadow-sm"
                    onClick={() => decreaseQty(product.id)}
                  >
                    -
                  </button>
                  <div className="fw-semibold text-center flex-grow-1">
                    {cartItem.quantity}
                  </div>
                  <button
                    className="btn btn-warning fw-semibold shadow-sm"
                    onClick={handleIncrease}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-warning w-100 fw-semibold shadow-sm"
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              )}

              <button
                className="btn btn-danger w-100 fw-semibold shadow-sm"
                disabled={isOutOfStock}
                onClick={() => {
                  const added = cartItem ? true : addToCart(product);
                  if (added) {
                    navigate("/cart");
                  } else {
                    Swal.fire({
                      icon: "warning",
                      title: "Stock Limit Reached",
                      text: "You cannot add more of this product.",
                      showConfirmButton: false,
                      timer: 1800,
                      toast: true,
                      position: "top-end",
                    });
                  }
                }}
              >
                {isOutOfStock ? "Unavailable" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;

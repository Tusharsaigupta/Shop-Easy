import { Link } from "react-router-dom";
import Swal from "sweetalert2";

function ProductCard({
  product,
  cartItem,
  addToCart,
  increaseQty,
  decreaseQty,
}) {
  const isOutOfStock = product.stock <= 0;

  const cardStyle = {
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    width: "100%",
    height: "100%",
    background: "#fff",
  };

  const imageWrapStyle = {
    width: "100%",
    height: "220px",
    overflow: "hidden",
    background: "#f4f4f4",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const bodyStyle = {
    minHeight: "170px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
  };

  const actionsStyle = {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const handleAdd = () => {
    const added = addToCart(product);

    Swal.fire({
      icon: added ? "success" : "warning",
      title: added ? "Added to Cart" : "Stock Limit Reached",
      text: added ? product.name : "You cannot add more of this product.",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: "top-end",
    });
  };

  const handleIncrease = () => {
    const increased = increaseQty(product.id);

    Swal.fire({
      icon: increased ? "success" : "warning",
      title: increased ? "Added to Cart" : "Stock Limit Reached",
      text: increased ? product.name : "You cannot add more of this product.",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: "top-end",
    });
  };

  return (
    <div style={cardStyle}>
      <div style={imageWrapStyle}>
        <img src={product.image} alt={product.name} style={imageStyle} />
      </div>

      <div style={bodyStyle}>
        <div>
          <h6>{product.name}</h6>
          <p className="text-success fw-bold">${product.price}</p>

          {isOutOfStock && (
            <p className="text-danger small mb-0">Out of stock</p>
          )}
        </div>

        <div style={actionsStyle}>
          {cartItem ? (
            <div className="product-qty-row">
              <button
                className="product-qty-btn product-qty-side"
                onClick={() => decreaseQty(product.id)}
              >
                -
              </button>
              <div className="product-qty-count">
                {cartItem.quantity}
              </div>
              <button
                className="product-qty-btn product-qty-side"
                onClick={handleIncrease}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="btn btn-dark"
              disabled={isOutOfStock}
              onClick={handleAdd}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}

          <Link
            to={`/product/${product.id}`}
            className="btn btn-outline-dark"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

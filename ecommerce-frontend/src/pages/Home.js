import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../api";

function Home({ search, category, cart, addToCart, increaseQty, decreaseQty }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error Fetching Products:", err));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "" || product.category.toString() === category;

    const matchesCategoryName =
      category === "" ||
      product.category_name?.toLowerCase() === category.toLowerCase();

    return matchesSearch && (matchesCategory || matchesCategoryName);
  });

  return (
    <div className="home-container">
      <div className="hero-section text-center">
        <h1 className="hero-title">Discover Products</h1>
        <p className="hero-subtitle">
          Find the best deals on your favorite items
        </p>
      </div>

      <div className="custom-container">
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className="product-grid-item" key={product.id}>
                <ProductCard
                  product={product}
                  cartItem={cart.find((item) => item.id === product.id)}
                  addToCart={addToCart}
                  increaseQty={increaseQty}
                  decreaseQty={decreaseQty}
                />
              </div>
            ))
          ) : (
            <div className="w-100 text-center mt-5">
              <h4 className="text-muted">No products found</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
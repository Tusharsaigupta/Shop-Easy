import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { api, getAuthHeaders } from "./api";

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [products,setProducts] = useState([]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products/");
        setProducts(response.data); 
      } catch (error) {
        console.error("Backend not reached:", error);
      }
    };

    fetchProducts();
  }, []);

  // ✅ LOAD CART FROM LOCALSTORAGE (ONLY ONCE)
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/profile/", {
          headers: getAuthHeaders(),
        });

        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
      } catch (error) {
        console.error("Unable to load profile:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const handleUserProfileUpdated = (event) => {
      if (event.detail) {
        setUser(event.detail);
      }
    };

    window.addEventListener("user-profile-updated", handleUserProfileUpdated);

    return () => {
      window.removeEventListener(
        "user-profile-updated",
        handleUserProfileUpdated,
      );
    };
  }, []);

  // 🔥 SYNC CART TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🛒 ADD TO CART
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        return false;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, stock: product.stock }
            : item,
        ),
      );
      return true;
    }

    if (product.stock <= 0) {
      return false;
    }

    setCart([...cart, { ...product, quantity: 1 }]);
    return true;
  };

  const increaseQty = (id) => {
    const targetItem = cart.find((item) => item.id === id);

    if (!targetItem || targetItem.quantity >= targetItem.stock) {
      return false;
    }

    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
    return true;
  };

  const decreaseQty = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  return (
    <div className="App">
      <Navbar
        setSearch={setSearch}
        setCategory={setCategory}
        cart={cart}
        user={user}
        setUser={setUser}
        setCart={setCart}
      />

      <div className="app-container">
        <AppRoutes
          search={search}
          category={category}
          cart={cart}
          addToCart={addToCart}
          setCart={setCart}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
          removeItem={removeItem}
          products={products}
          user={user}
          setUser={setUser}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;

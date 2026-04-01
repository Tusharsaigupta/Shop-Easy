import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProductDetails from "../pages/ProductDetails";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import Payment from "../pages/Payment";
import Success from "../pages/Success";
import Profile from "../pages/Profile";

// 🔐 PROTECTED ROUTE
function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: window.location.pathname }} // ✅ FIX
      />
    );
  }

  return children;
}

function AppRoutes({
  search,
  category,
  cart,
  setCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeItem,
  products,
  user,
  setUser,
  loading,
}) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            search={search}
            category={category}
            cart={cart}
            addToCart={addToCart}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
          />
        }
      />

      <Route
        path="/cart"
        element={
          <Cart
            cart={cart}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
          />
        }
      />

      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/signup" element={<Signup setUser={setUser} />} />

      <Route
        path="/product/:id"
        element={
          <ProductDetails
            products={products}
            cart={cart}
            addToCart={addToCart}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
          />
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Checkout cart={cart} setCart={setCart} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Payment setCart={setCart} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/success" element={<Success setCart={setCart} />} />
    </Routes>
  );
}

export default AppRoutes;

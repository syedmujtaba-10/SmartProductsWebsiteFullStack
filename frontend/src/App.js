import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Books from "./pages/Books";
import Add from "./pages/Add";
import Update from "./pages/Update";
import "./style.css"
import Login from "./Login";
import Home from "./pages/Home";
import Category from "./pages/Category";
import TopBar from './pages/TopBar';
import NavBar from './pages/NavBar';
import Cart from "./pages/Cart";
import Register from "./pages/Register";
import Products from "./pages/Products";
import AddProducts from "./pages/AddProducts";
import CreateCustomer from "./pages/CreateCustomer";
import AddOrder from "./pages/AddOrder";
import ManageOrder from "./pages/ManageOrder";
import UpdateOrder from "./pages/UpdateOrder";
import ViewProduct from "./pages/ViewProduct";
import OrderStatus from "./pages/OrderStatus";
import ReviewForm from "./pages/ReviewForm";
import Trending from "./pages/Trending";


function App() {
  return (
    <BrowserRouter> {/* Ensure this wraps your entire app */}
      <div>
        <TopBar /> {/* TopBar is inside BrowserRouter */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-product" element={<AddProducts />} />
          <Route path="/salesman/customers" element={<CreateCustomer />} />
          <Route path="/add-order" element={<AddOrder />} />
          <Route path="/manage-orders" element={<ManageOrder />} />
          <Route path="/update-order/:id" element={<UpdateOrder />} />
          <Route path="/view-product/:id" element={<ViewProduct />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/review-form/:id" element={<ReviewForm />} />
          <Route path="/trending" element={<Trending />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

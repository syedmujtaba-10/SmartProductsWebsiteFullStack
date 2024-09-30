import express from "express"
import mysql from "mysql"
import  cors from "cors"
import path from "path"
import { fileURLToPath } from 'url';
import { MongoClient } from "mongodb";
import multer from "multer";

const app = express()

const mongoUri = "mongodb+srv://s11:mongodb%40123@cluster0.i65fa.mongodb.net/productdb?retryWrites=true&w=majority&appName=Cluster0"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'public/images')));
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "smartstore"
})

app.use(express.json())
app.use(cors())

app.get("/", (req,res)=>{
    res.json("Hello this is the backend!")
})

// Initialize MongoDB connection
let mongoDb;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
  .then(() => {
    mongoDb = client.db('productdb');  // Use the database 'productdb'
    console.log("MongoDB connected!");
  })
  .catch((err) => console.error("MongoDB connection failed:", err));
/*app.get("/books", (req,res)=>{
    const q = "SELECT * FROM books"
    db.query(q,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.get('/books/:id', (req, res) => {
    db.query('SELECT * FROM books WHERE idbooks = ?', [req.params.id], (error, results) => {
      res.json(results);
    });
  });

app.post("/books", (req,res)=>{
    const q = "INSERT INTO books (`title`, `desc`, `price`, `cover`) VALUES (?)";
    const values = [req.body.title,req.body.desc,req.body.price,req.body.cover,];

    db.query(q,[values], (err,data)=>{
        if(err) return res.json(err)
        return res.json("Book created!")
    })
})

app.delete("/books/:id", (req,res)=>{
    const bookId = req.params.id;
    const q = "DELETE FROM `test`.`books` WHERE idbooks = ?";

    db.query(q,[bookId], (err,data) =>{
        if(err) return res.json(err)
        return res.json("Book deleted!")
    })
})

app.put("/books/:id", (req,res)=>{
    const bookId = req.params.id;
    const q = "UPDATE books SET `title` = ?, `desc` = ?, `price` = ?, `cover` = ? WHERE idbooks= ?";
    const values = [req.body.title,req.body.desc,req.body.price,req.body.cover,];
    db.query(q,[...values,bookId], (err,data) =>{
        if(err) return res.json(err)
        return res.json("Book Updated!")
    })
})*/

app.post('/login', (req, res) => {
    const { username, password, role } = req.body;
    const q = "SELECT * FROM users WHERE username = ? AND password = ? AND role = ?";
    
    db.query(q, [username, password, role], (err, results) => {
        if (err) return res.json(err);
        
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const userId = results[0].id;
        const userRole = results[0].role; // Get the role from the database
        
        return res.status(200).json({
            message: "Login successful",
            user_id: userId,     // Send the userId to the frontend
            role: userRole       // Send the role to the frontend
        });
    });
});

app.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    const query = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(query, [username, password, role], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error registering user' });

        const userId = result.insertId;  // Get the inserted user's ID
        res.status(201).json({ user_id: userId });  // Send back the user ID
    });
});

app.post('/customers', (req, res) => {
    const { user_id, customer_name, street, city, state, zip_code } = req.body;

    const query = "INSERT INTO customers (user_id, customer_name, street, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [user_id, customer_name, street, city, state, zip_code], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error inserting customer details' });

        res.status(201).json({ message: 'Customer added successfully' });
    });
});

app.get('/customers', (req, res) => {
    const query = `
        SELECT users.id AS user_id, customers.customer_name, customers.street, customers.city, customers.state, customers.zip_code
        FROM customers
        JOIN users ON customers.user_id = users.id
        WHERE users.role = 'Customers'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching customers:", err.message);
            return res.status(500).json({ message: 'Error fetching customers', error: err });
        }

        res.status(200).json(results);
    });
});


app.get('/customers/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = "SELECT * FROM customers WHERE user_id = ?";
    db.query(query, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error fetching customer details' });
        if (result.length === 0) return res.status(404).json({ error: 'Customer not found' });
        res.status(200).json(result[0]);
    });
});



app.get('/products', (req, res) => {
    const { category } = req.query; // Get category from query parameters
    const q = 'SELECT * FROM products WHERE category = ?';
    
    db.query(q, [category], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.status(200).json(results);
    });
  });

  app.post('/cart', (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    // Check if a cart exists for the user
    const checkCartQuery = "SELECT id FROM carts WHERE user_id = ?";
    db.query(checkCartQuery, [user_id], (err, cartResults) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        let cart_id;

        if (cartResults.length === 0) {
            // If no cart exists, create one for the user
            const createCartQuery = "INSERT INTO carts (user_id) VALUES (?)";
            db.query(createCartQuery, [user_id], (err, cartCreationResults) => {
                if (err) return res.status(500).json({ message: 'Error creating cart', error: err });
                cart_id = cartCreationResults.insertId;
                // Now add the product to the cart
                addProductToCart(cart_id, product_id, quantity, res);
            });
        } else {
            cart_id = cartResults[0].id;
            addProductToCart(cart_id, product_id, quantity, res);
        }
    });
});
app.get('/all-products', (req, res) => {
    const query = "SELECT * FROM products";
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(200).json(results);
    });
});
// Delete a product by ID
app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = "DELETE FROM products WHERE id = ?";
    
    db.query(query, [productId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting product', error: err });
        res.status(200).json({ message: 'Product deleted successfully' });
    });
});
// Update a product by ID
app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const { name, price, description } = req.body;

    const query = "UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?";
    
    db.query(query, [name, price, description, productId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating product', error: err });
        res.status(200).json({ message: 'Product updated successfully' });
    });
});



// Function to add product to the cart
function addProductToCart(cart_id, product_id, quantity, res) {
    const addItemQuery = "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?";
    db.query(addItemQuery, [cart_id, product_id, quantity, quantity], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error adding product to cart', error: err });
        res.status(200).json({ message: 'Product added to cart' });
    });
}
app.get('/cart/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const query = `
        SELECT p.id, p.name, p.price, p.description, p.image, ci.quantity
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = ?
    `;
    db.query(query, [user_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(results);
    });
});
app.get('/cart/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const query = `
        SELECT p.id, p.name, p.price, p.description, p.image, ci.quantity
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = ?
    `;
    db.query(query, [user_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json(results);
    });
});

// Get product details by product_id
app.get('/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM products WHERE id = ?';
    
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error("Error fetching product:", err);
            return res.status(500).json({ message: 'Error fetching product' });
        }
        res.json(results[0]);  // Assuming only one product is returned
    });
});
app.post('/products', (req, res) => {
    const { name, price, description, image, category } = req.body;

    const query = "INSERT INTO products (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [name, price, description, image, category], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error adding product', error: err });
        res.status(201).json({ message: 'Product added successfully' });
    });
});





app.post('/orders', (req, res) => {
    const {
        user_id,
        customer_name,
        customer_address,
        credit_card_number,
        purchase_date,
        ship_date,
        products,  // Array of products
        shipping_cost,
        discount,
        total_sales,
        store_id,
        store_address,
        transaction_id  // Expect transaction_id from frontend or generate it
    } = req.body;

    // Insert the main order into the orders table
    const orderQuery = `
      INSERT INTO orders (transaction_id, user_id)
      VALUES (?, ?)
    `;
    
    db.query(orderQuery, [transaction_id, user_id], (err, orderResult) => {
        if (err) {
            console.error("Error inserting order:", err.message);
            return res.status(500).json({ message: 'Error placing order', error: err });
        }

        const orderId = orderResult.insertId;  // Get the newly created order ID

        // Insert each product into the order_products table
        const productQueries = products.map(product => {
            return new Promise((resolve, reject) => {
                const productQuery = `
                  INSERT INTO order_products (transaction_id, order_id, user_id, customer_name, customer_address, credit_card_number, purchase_date, ship_date, product_id, category, quantity, price, shipping_cost, discount, total_sales, store_id, store_address)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                db.query(productQuery, [
                    transaction_id, orderId, user_id, customer_name, customer_address, credit_card_number, purchase_date, ship_date, product.id, product.category, product.quantity, product.price, shipping_cost, discount, total_sales, store_id, store_address
                ], (err, result) => {
                    if (err) {
                        console.error("Error inserting product:", err.message);
                        reject(err);
                    }
                    resolve(result);
                });
            });
        });

        // Execute all product queries
        Promise.all(productQueries)
          .then(() => res.status(200).json({ message: 'Order placed successfully!', order_id: orderId }))
          .catch(err => {
              console.error("Error inserting products:", err.message);
              res.status(500).json({ message: 'Error inserting products', error: err });
          });
    });
});

// Clear cart for a specific user
app.delete('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = 'DELETE FROM carts WHERE user_id = ?';
    
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error clearing cart:", err);
            return res.status(500).json({ message: 'Error clearing cart' });
        }
        res.status(200).json({ message: 'Cart cleared successfully' });
    });
});
// Remove specific product from cart
// Remove specific cart item by its unique cart item ID
app.delete('/cart/item/:cartItemId', (req, res) => {
    const cartItemId = req.params.cartItemId;
    const query = 'DELETE FROM cart_items WHERE id = ?';  // Assuming 'id' is the unique identifier for the cart item

    db.query(query, [cartItemId], (err, result) => {
        if (err) {
            console.error("Error removing cart item:", err);
            return res.status(500).json({ message: 'Error removing cart item' });
        }
        res.status(200).json({ message: 'Cart item removed successfully' });
    });
});
// Get all stores for in-store pickup
app.get('/stores', (req, res) => {
    const query = 'SELECT * FROM stores';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching stores:", err);
            return res.status(500).json({ message: 'Error fetching stores' });
        }
        res.json(results);  // Return the list of stores
    });
});
app.post('/salesman/customers', (req, res) => {
    const { username, password, customer_name, street, city, state, zip_code } = req.body;

    // First, insert into the users table
    const userQuery = "INSERT INTO users (username, password, role) VALUES (?, ?, 'Customers')";
    db.query(userQuery, [username, password], (err, userResult) => {
        if (err) return res.status(500).json({ message: 'Error creating user', error: err });

        const userId = userResult.insertId;  // Get the new user ID

        // Now, insert into the customers table
        const customerQuery = "INSERT INTO customers (user_id, customer_name, street, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(customerQuery, [userId, customer_name, street, city, state, zip_code], (err, customerResult) => {
            if (err) return res.status(500).json({ message: 'Error creating customer', error: err });
            res.status(201).json({ message: 'Customer created successfully' });
        });
    });
});
app.put('/order-products/:id', (req, res) => {
    const { id } = req.params;
    const { product_id, customer_name, quantity, total_sales, customer_address, credit_card_number } = req.body;

    const query = `
        UPDATE order_products 
        SET product_id = ?, customer_name = ?, quantity = ?, total_sales = ?, customer_address = ?, credit_card_number = ?
        WHERE id = ?
    `;
    db.query(query, [product_id, customer_name, quantity, total_sales, customer_address, credit_card_number, id], (err, result) => {
        if (err) {
            console.error('Error updating order:', err);
            return res.status(500).json({ message: 'Error updating order', error: err });
        }

        // Check if any rows were affected (i.e., whether the update was successful)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order updated successfully' });
    });
});

// Delete a product from order_products by its 'id' and check if the order_id is empty after deletion
// Delete a product from order_products by its 'id' and check if the order_id is empty after deletion
// Delete a product from order_products by its 'id'
// Get a specific product from order_products by its 'id'
app.get('/order-products/:id', (req, res) => {
    const { id } = req.params;

    const fetchQuery = `SELECT * FROM order_products WHERE id = ?`;
    db.query(fetchQuery, [id], (err, result) => {
        if (err) {
            console.error('Error fetching product from order_products:', err);
            return res.status(500).json({ message: 'Error fetching product from order_products', error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(result[0]);  // Send the product details as the response
    });
});

// Delete a product from order_products by 'id' and check if the order_id still has products
app.delete('/order-products/:id', (req, res) => {
    const { id } = req.params;

    // First, fetch the order_id associated with the 'id' being deleted
    const fetchOrderIdQuery = `SELECT order_id FROM order_products WHERE id = ?`;
    db.query(fetchOrderIdQuery, [id], (err, result) => {
        if (err) {
            console.error('Error fetching order_id for the product:', err);
            return res.status(500).json({ message: 'Error fetching order_id for the product', error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Product not found in order_products' });
        }

        const orderId = result[0].order_id;

        // Delete the product from order_products
        const deleteProductQuery = `DELETE FROM order_products WHERE id = ?`;
        db.query(deleteProductQuery, [id], (err, deleteResult) => {
            if (err) {
                console.error('Error deleting product from order_products:', err);
                return res.status(500).json({ message: 'Error deleting product from order_products', error: err });
            }

            // After deletion, check if any other products remain for the same order_id
            const checkProductsQuery = `SELECT * FROM order_products WHERE order_id = ?`;
            db.query(checkProductsQuery, [orderId], (err, remainingResults) => {
                if (err) {
                    console.error('Error checking remaining products:', err);
                    return res.status(500).json({ message: 'Error checking remaining products', error: err });
                }

                // If no products remain for the order_id, delete the order from orders table
                if (remainingResults.length === 0) {
                    const deleteOrderQuery = `DELETE FROM orders WHERE order_id = ?`;
                    db.query(deleteOrderQuery, [orderId], (err, deleteOrderResult) => {
                        if (err) {
                            console.error('Error deleting order:', err);
                            return res.status(500).json({ message: 'Error deleting order', error: err });
                        }
                        res.status(200).json({ message: 'Product and order deleted successfully' });
                    });
                } else {
                    res.status(200).json({ message: 'Product deleted successfully' });
                }
            });
        });
    });
});




// Delete an order from orders table
app.delete('/orders/:orderId', (req, res) => {
    const { orderId } = req.params;

    const deleteOrderQuery = `DELETE FROM orders WHERE order_id = ?`;
    db.query(deleteOrderQuery, [orderId], (err, result) => {
        if (err) {
            console.error('Error deleting order:', err);
            return res.status(500).json({ message: 'Error deleting order', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    });
});

app.get('/orders-products', (req, res) => {
    const query = `
        SELECT 
            op.id,
            op.order_id, 
            op.product_id, 
            op.customer_name, 
            op.quantity, 
            op.total_sales, 
            op.customer_address, 
            op.credit_card_number,
            op.store_address,  
            o.transaction_id, 
            o.user_id
        FROM order_products AS op
        JOIN orders AS o ON op.order_id = o.order_id
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ message: 'Error fetching orders', error: err });
        }
        res.status(200).json(results);
    });
});

app.get('/accessories', (req, res) => {
    const productId = req.query.product_id;
    const query = 'SELECT * FROM accessories WHERE product_id = ?';
    
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error("Error fetching accessories:", err);
            return res.status(500).json({ message: 'Error fetching accessories' });
        }
        res.json(results);
    });
});

app.get('/order-status', (req, res) => {
    const { user_id, order_id } = req.query;

    const query = `
        SELECT op.id, op.product_id, p.name as product_name, op.purchase_date, op.ship_date, op.store_address, op.price
        FROM order_products op
        JOIN products p ON op.product_id = p.id
        WHERE op.user_id = ? AND op.order_id = ?
    `;

    db.query(query, [user_id, order_id], (err, results) => {
        if (err) {
            console.error('Error fetching order status:', err);
            return res.status(500).json({ message: 'Error fetching order status' });
        }

        res.status(200).json(results);
    });
});

/*MongoDB COde*/
// Route to add a new product review
app.post('/productreview', async (req, res) => {
    const review = req.body;  // Get the review from the request body
  
    try {
      const result = await mongoDb.collection('productreview').insertOne(review);
      res.status(201).json({ message: 'Review added successfully', reviewId: result.insertedId });
    } catch (error) {
      console.error("Error inserting review:", error);
      res.status(500).json({ message: 'Error adding review' });
    }
  });
// Route to get reviews for a specific product by ProductModelName
app.get('/productreview/:ProductModelName', async (req, res) => {
    const ProductModelName = req.params.ProductModelName;  // Get the product model name from the URL parameter
  
    try {
      const reviews = await mongoDb.collection('productreview').find({ ProductModelName }).toArray();
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });
 /*TRENDING BACKEND*/
 app.get('/trending/most-liked', async (req, res) => {
    try {
        const mostLikedProducts = await mongoDb.collection('productreview')
            .aggregate([
                { $match: { ReviewRating: 5 } },  // Filter products with 5-star reviews
                { $group: { _id: "$ProductModelName", count: { $sum: 1 } } },  // Group by product and count the reviews
                { $sort: { count: -1 } },  // Sort by the count in descending order
                { $limit: 5 }  // Limit to the top 5 products
            ])
            .toArray();

        res.status(200).json(mostLikedProducts);
    } catch (error) {
        console.error("Error fetching most liked products:", error);
        res.status(500).json({ message: 'Error fetching most liked products' });
    }
});
app.get('/trending/top-zip-codes', (req, res) => {
    const query = `
        SELECT 
            SUBSTRING_INDEX(customer_address, ',', -1) AS zip_code, 
            COUNT(*) AS count 
        FROM order_products 
        GROUP BY zip_code 
        ORDER BY count DESC 
        LIMIT 5;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching top zip codes:', err);
            return res.status(500).json({ message: 'Error fetching top zip codes' });
        }

        res.status(200).json(results);
    });
});
app.get('/trending/most-sold-products', (req, res) => {
    const query = `
        SELECT 
            p.id, p.name, p.price, p.image, COUNT(op.product_id) AS count 
        FROM order_products op
        JOIN products p ON op.product_id = p.id
        GROUP BY op.product_id
        ORDER BY count DESC 
        LIMIT 5;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching most sold products:', err);
            return res.status(500).json({ message: 'Error fetching most sold products' });
        }

        res.status(200).json(results);
    });
});








app.listen(8800, ()=>{
    console.log("Connected to backend!")
})
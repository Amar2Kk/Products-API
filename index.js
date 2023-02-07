import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv' 

dotenv.config()

const connection = mysql.createPool({
  host:process.env.HOST,
  port:process.env.DB_PORT,
  user:process.env.USER,
  password:process.env.PASSWORD,
  database:process.env.DATABASE,
  connectionLimit: 10,
})

const app = express();
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is Running on http://localhost:${PORT}`))

app.use(bodyParser.json());
app.use(cors())

app.get('/', (req, res) => {
  res.send('use /products in the url to get all products')
});
//get all products
app.get('/products', (req, res) => {
  connection.execute("SELECT * FROM products", (err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
});

// get a product by id
app.get('/products/:id', (req, res) => {
  connection.query(`SELECT * FROM products WHERE id = ${req.params.id}`, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: 'Error retrieving product from the database.' });
    }
    if (results.length === 0) return res.status(404).json({ message: 'product not found' });
    res.status(200).json(results);
  })
});

//add new product
app.post('/products', (req, res) => {
  const { name, price, description } = req.body;
  connection.query('INSERT INTO products (name, price, description) VALUES (?,?,?)', [name, price, description], (error, results) => {
    if (error) throw error;
    res.status(201).send(`Product added with ID: ${results.insertId}`);
  });
});


//update product 
app.patch('/products/:id', (req, res) => {
  const { name, price, description } = req.body;
  const { id } = req.params;
  connection.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
    if (error) throw error;
    connection.query('UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?', [name, price, description, id], (error, results) => {
      if (error) throw error;
      res.send(`Product ${id} has been updated`);
    });
  });
});


//delete product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
    if (error) throw error;
    connection.query('DELETE FROM products WHERE id = ?', [id], (error, results) => {
      if (error) throw error;
      res.send(`Product with id ${id} deleted`);
    });
  });
});

import express from "express"
import mysql from "mysql"
import cors from "cors"

const app = express()
const port = 5000;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "allscan"
})

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.json("Hello this is the backend");
})

app.get('/api/products', (req, res) => {
    const q = "SELECT * FROM product";
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/api/product/:productCode', (req, res) => {
    const productCode = req.params.productCode;
    const q = "SELECT * FROM product WHERE productCode = ?";
    db.query(q, [productCode], (err, data) => {
        if (err) return res.json(err);
        if (data.length === 0) return res.status(404).json({ message: 'Product not found' });
        if (data[0].qrCode) {
            data[0].qrCode = Buffer.from(data[0].qrCode).toString('base64');
        }
        return res.json(data[0]);
    });
});

app.post('/api/create', (req,res) => {
    const q = "INSERT INTO product (`name`, `quantity`, `productCode`, `location`, `qrCode`) VALUES (?)"
    const values = [
        req.body.name,
        req.body.quantity,
        req.body.productCode,
        req.body.location,
        Buffer.from(req.body.qrCode.split(',')[1], 'base64') // converting the qrCode field to base64
    ]

    db.query(q, [values], (err, data) => {
        if(err) return res.json(err);
        return res.json("A product has been created!");
    })
})

app.put('/api/update-location/:productCode', (req, res) => {
    const productCode = req.params.productCode;
    const location = req.body.location;
    const q = "UPDATE product SET location = ? WHERE productCode = ?";

    db.query(q, [location, productCode], (err, data) => {
        if (err) return res.json(err);
        if (data.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        return res.json("Location updated successfully!");
    });
});

app.listen(port, () => {
    console.log("Listening to port 5000");
})
const express = require('express');
require('dotenv').config();
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};
    Database=${process.env.DB_DATABASE};Trusted_Connection=Yes;`,
};

const app = express();
const PORT = 5000;

app.use(cors());
const reg_bus = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 6
});

app.get('/', function(req, res){
    sql.connect(config, function(err){
        if (err)
            console.log(err);
        else {
            let request = new sql.Request();
            request.query("SELECT * FROM Managers", (err, record) => {
                if (err)  
                    console.log(err);
                else
                    console.log(record);
            })
        }
    })
    res.end("It worked!");
});

app.post("/register/business", reg_bus, (req, res) => {
    const {name, email, username, password, business, address} = req.body;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("O_name", name)
            .input("O_email", email)
            .input("O_username", username)
            .input("O_password", password)
            .input("BusinessName", business)
            .input("HQAddress", address)
            .execute("insert_OwnersAndBusiness", (err) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    res.json({message: "It was added successfully"});
                }
            });
        }
    })
});

const reg_man = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 5
});

app.post("/register/manager", reg_man, (req, res) =>
{
    const {name, email, username, password, businessID} = req.body;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("name", name)
            .input("email", email)
            .input("username", username)
            .input("password", password)
            .input("BusinessID", businessID)
            .execute("insert_Managers", (err) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    res.json({message: "It was added successfully"});
                }
            });
        }
    })
});

const add_sto = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 3
});

app.post("/add_store", add_sto, (req, res) =>
{
    const {name, businessID, address} = req.body;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("StoreName", name)
            .input("BusinessID", businessID)
            .input("StoreAddress", address)
            .execute("insert_Stores", (err) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    res.json({message: "It was added successfully"});
                }
            });
        }
    })
});

const add_pro = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 4
});

app.post("/add_product", add_pro, (req, res) =>
{
    const {name, businessID, category, price} = req.body;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("ProductName", name)
            .input("BusinessID", businessID)
            .input("Category", category)
            .input("PricePerUnit", price)
            .execute("insert_Products", (err) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    res.json({message: "It was added successfully"});
                }
            });
        }
    })
});

const add_inventory = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 2
});

app.post("/add_inventory", add_inventory, (req, res) =>
{
    const {productID, warehouseID} = req.body;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("ProductID", productID)
            .input("WarehouseID", warehouseID)
            .execute("insert_ProductinWarehouse", (err) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    res.json({message: "It was added successfully"});
                }
            });
        }
    })
});

const add_stock = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 4
});

app.post("/add_stockreq", add_stock, (req, res) =>
{
    const {storeID, productID, quantity, message} = req.body;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("ProductID", productID)
            .input("RequestingStoreID", storeID)
            .input("RequestedQuantity", quantity)
            .input("message", message)
            .execute("insert_StockRequests", (err) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    res.json({message: "It was added successfully"});
                }
            });
        }
    })
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

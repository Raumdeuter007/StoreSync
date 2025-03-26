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
                    res.json({ message: "It was added successfully"});
                }
            });
        }
    })
});

app.delete("/store/:id", (req, res) =>
{
    const { id }= req.params;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("StoreID", id)
            .execute("delete_store", (err, record) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    console.log(record);
                    if (record.rowsAffected[0] === 0)
                        res.status(404).json({ message: "Store Not found"});
                    else
                        res.json({ message: "It was deleted successfully"});
                }
            });
        }
    })
});

app.delete("/product/:id", (req, res) =>
{
    const { id }= req.params;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("ProductID", id)
            .execute("delete_product", (err, record) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    console.log(record);
                    if (record.rowsAffected[0] === 0)
                        res.status(404).json({ message: "Product Not found"});
                    else
                        res.json({ message: "It was deleted successfully"});
                }
            });
        }
    })
});

app.delete("/stock_req/:id", (req, res) =>
{
    const { id } = req.params;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("RequestID", id)
            .execute("Cancel_StockRequest", (err, record) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    console.log(record);
                    if (record.rowsAffected[0] === 0)
                        res.status(404).json({ message: "Stock Request Not found"});
                    else
                        res.json({ message: "Request was deleted successfully"});
                }
            });
        }
    })
});

app.delete("/stock_req/:id", (req, res) =>
{
    const { id } = req.params;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("RequestID", id)
            .execute("Cancel_StockRequest", (err, record) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    console.log(record);
                    if (record.rowsAffected[0] === 0)
                        res.status(404).json({ message: "Stock Request Not found"});
                    else
                        res.json({ message: "Request was deleted successfully"});
                }
            });
        }
    })
});
    
app.delete("/sto_manager/:id", (req, res) =>
{
    const { id } = req.params;
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("ManagerID", id)
            .execute("delete_manager_withNoAssignedStore", (err, record) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    console.log(record);
                    if (record.rowsAffected[0] === 0)
                        res.status(404).json({ message: "Manager Not found"});
                    else
                        res.json({ message: "Store Manager was deleted successfully"});
                }
            });
        }
    })
});

app.delete("/notification/:id", (req, res) =>
{
    const { id } = req.params; // Change this to session id
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
            res.status(505).json({ message: "Could not connect", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("ownerID", id)
            .execute("Remove_Read_Notifications", (err, record) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    console.log(record);
                    if (record.rowsAffected[0] === 0)
                        res.status(404).json({ message: "Manager Not found"});
                    else
                        res.json({ message: "Store Manager was deleted successfully"});
                }
            });
        }
    })
});

const login_auth = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 2
});

app.post("/owner/login", login_auth, (req, res) =>
{
    const { username, password } = req.body;
    sql.connect(config, (err) =>
    {
        if (err)
        {
            console.log(err);
            res.json({ message: "Could not connect to Database", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("username", username)
            .input("password", password)
            .execute("VerifyOwnerLogin", (err, record) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    if (record.recordsets.length === 0)
                        res.status(404).json({ message: "Incorrect Credentials"});
                    else
                    {
                        let business = new sql.Request();
                        business
                        .input("OwnerID", record.recordset[0].ownerID)
                        .execute("Business_detailOfOwner", (err, rec) =>
                        {
                            if (err)
                            {
                                console.log(err)
                                res.json({ message: "Could not execute query" });
                            }
                            else
                            {
                                res.json({ message: "Login successful", business: rec.recordset[0], 
                                    user: record.recordset[0]});
                            }
                        });
                    }
                }
            });
        }
    })
});

app.post("/manager/login", login_auth, (req, res) =>
{
    const { username, password } = req.body;
    sql.connect(config, (err) =>
    {
        if (err)
        {
            console.log(err);
            res.json({ message: "Could not connect to Database", err});
        }
        else
        {
            let request = new sql.Request();
            request
            .input("username", username)
            .input("password", password)
            .execute("VerifyManagerLogin", (err, record) => {
                if (err)
                {
                    console.log(err);
                    res.status(505).json({ message: "Could not execute query", err});
                }
                else
                {
                    if (record.recordsets.length === 0)
                        res.status(404).json({ message: "Incorrect Credentials"});
                    else
                    {
                        let store = new sql.Request();
                        store
                        .input("ManagerID", record.recordset[0].managerID)
                        .execute("StoreDetailsOfManagers", (err, rec) =>
                        {
                            if (err)
                            {
                                console.log(err)
                                res.json({ message: "Could not execute query" });
                            }
                            else
                            {
                                console.log(rec);
                                if (rec.recordset.length !== 0)
                                {
                                    let store = new sql.Request();
                                    store
                                    .input("StoreID", rec.recordset[0].StoreID)
                                    .execute("InventoryStockDetails", (err, reco) =>
                                    {
                                        if (err)
                                        {
                                            console.log(err)
                                            res.json({ message: "Could not execute query" });
                                        }
                                        else
                                        {    
                                            res.json({ message: "Login successful", Store: rec.recordset[0], 
                                                user: record.recordset[0], inventory: reco.recordset});
                                        }
                                    });
                                }
                                else
                                {
                                    res.json({ message: "Login successful", Store: rec.recordset[0], 
                                        user: record.recordset[0]});
                                }
                            }
                        });
                    }
                }
            });
        }
    })
});

const get_req = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 0
});

app.get("/owner/stores", get_req, (req, res) =>
{

});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

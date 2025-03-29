const express = require('express');
require('dotenv').config();
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');
const session = require("express-session");
const passport = require('passport');
const { Strategy } = require('passport-local');

const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};
    Database=${process.env.DB_DATABASE};Trusted_Connection=Yes;`,
};

passport.use('owner',
    new Strategy(async (username, password, done) => {
        try 
        {
            const pool = await sql.connect(config);
            let result = await pool.request()
                .input("username", username)
                .input("password", password)
                .execute("VerifyOwnerLogin");
            
            console.log(result);
            if (result.recordsets.length === 0)
                done(null, false);  
            else {
                const dict = {
                    user_id: result.recordset[0].ownerID, 
                    role: 'owner',        
                };
                done(null, dict);
            }         
        }
        catch (err)
        {
            console.log(err);
            done(err, false);
        }        
}));

passport.use('manager',
    new Strategy(async (username, password, done) => {
        try 
        {
            const pool = await sql.connect(config);
            let result = await pool.request()
            .input("username", username)
            .input("password", password)
            .execute("VerifyManagerLogin");

            console.log(result);
            if (result.recordsets.length === 0)
                done(null, false);  
            else {
                const dict = {
                    user_id: result.recordset[0].managerID, 
                    role: 'manager',        
                };
                done(null, dict);
            }         
        }
        catch (err)
        {
            console.log(err);
            done(err, false);
        }        
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (login, done) => {
    try {
        const pool = await sql.connect(config);
        if (login.role === 'owner')
        {
            let result = await pool.request()
            .input("id", login.user_id)
            .query("SELECT * FROM Owners WHERE ownerid = @id");
            if (result.recordsets.length === 0)
                done(null, false, {message: "No such user"});
            else
            {
                const dict = {
                    user_id: result.recordset[0].ownerID, 
                    role: 'owner'        
                };
                done(null, dict);
            }
        }
        else if (login.role === 'manager')
        {
            let result = await pool.request()
            .input("id", login.user_id)
            .query("SELECT * FROM Managers WHERE managerid = @id")
            if (result.recordsets.length === 0)
                done(null, false, {message: "No such user"});
            else
            {
                const dict = {
                    user_id: result.recordset[0].ownerID, 
                    role: 'manager'        
                };
                done(null, dict);
            }
        }
    }
    catch (err)
    {
        console.log(err);
        return done(err, false);
    }
});

const auth_both = (req, res, next) =>
{
    if (req.isAuthenticated()) return next();
    return res.status(401).json({message: "You are not authorized"});
};

const auth_owner = (req, res, next) =>
{
    if (req.isAuthenticated() && req.user.role === 'owner') return next();
    return res.status(401).json({message: "You are not authorized"});
};

const auth_man = (req, res, next) =>
{
    if (req.isAuthenticated() && req.user.role === 'manager') return next();
    return res.status(401).json({message: "You are not authorized"});
};

const app = express();
const PORT = 5000;

app.use(cors());
const reg_bus = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 6
});

app.use(
    session({
        secret: "H9b4fV6RZT7TgPEmdZ4IdRh5me7Tv01o",
        saveUninitialized: false, 
        resave: false,
        cookie: {
            maxAge: 60000 * 60 // Cookie Time 1 hr
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

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

app.post("/owner/register", reg_bus, async (req, res) => {
    const {name, email, username, password, business, address} = req.body;
    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input("O_name", name)
        .input("O_email", email)
        .input("O_username", username)
        .input("O_password", password)
        .input("BusinessName", business)
        .input("HQAddress", address)
        .execute("insert_OwnersAndBusiness");
        res.json({message: "It was added successfully"});
    }
    catch(err)
    {
        console.log(err);
        res.status(505).json({ message: "Database Error", err});
    }
});

const reg_man = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 5
});

app.post("/manager/register", reg_man, async (req, res) =>
{
    const {name, email, username, password, businessID} = req.body;
    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input("name", name)
        .input("email", email)
        .input("username", username)
        .input("password", password)
        .input("BusinessID", businessID)
        .execute("insert_Managers");
        res.json({message: "It was added successfully"});
    }
    catch(err)
    {
        console.log(err);
        res.status(505).json({ message: "Database Error", err});
    }
});

const add_sto = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 3
});

app.post("/owner/add_store", add_sto, auth_owner, (req, res) =>
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

app.post("/owner/add_product", add_pro, auth_owner, (req, res) =>
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

app.post("/add_inventory", add_inventory, auth_both, (req, res) =>
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
    if (!req.session.user)
        return res.status(401).json({ message: "Login User First"});
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
    if (!req.session.user)
        return res.status(401).json({ message: "Login User First"});
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
    if (!req.session.user)
        return res.status(401).json({ message: "Login User First"});
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
    if (!req.session.user)
        return res.status(401).json({ message: "Login User First"});
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
    if (!req.session.user)
        return res.status(401).json({ message: "Login User First"});
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
    
app.delete("owner/sto_manager/:id", (req, res) =>
{
    if (!req.session.user)
        return res.status(401).json({ message: "Login User First"});
    else if (!req.session.user.ownerID)
        return res.status(401).json({ message: "Manager is not authorized"});
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
    if (!req.session.user)
        return res.status(401).json({ message: "Login User First"});
    else if (!req.session.user.ownerID)
        return res.status(401).json({ message: "Manager is not authorized"});
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
                        res.status(404).json({ message: "Notification Not found"});
                    else
                        res.json({ message: "Notification was deleted successfully"});
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

app.post("/owner/login", login_auth, passport.authenticate("owner"), (req, res) =>
{
    res.status(200).json({message: "You are connected"});
    // const { username, password } = req.body;
    // sql.connect(config, (err) =>
    // {
    //     if (err)
    //     {
    //         console.log(err);
    //         res.json({ message: "Could not connect to Database", err});
    //     }
    //     else
    //     {
    //         let request = new sql.Request();
    //         request
    //         .input("username", username)
    //         .input("password", password)
    //         .execute("VerifyOwnerLogin", (err, record) => {
    //             if (err)
    //             {
    //                 console.log(err);
    //                 res.status(505).json({ message: "Could not execute query", err});
    //             }
    //             else
    //             {
    //                 if (record.recordsets.length === 0)
    //                     res.status(404).json({ message: "Incorrect Credentials"});
    //                 else
    //                 {
    //                     let business = new sql.Request();
    //                     business
    //                     .input("OwnerID", record.recordset[0].ownerID)
    //                     .execute("Business_detailOfOwner", (err, rec) =>
    //                     {
    //                         if (err)
    //                         {
    //                             console.log(err);
    //                             res.json({ message: "Could not execute query" });
    //                         }
    //                         else
    //                         {
    //                             req.session.user = record.recordset[0];
    //                             console.log(req.session.user)
    //                             res.json({ message: "Login successful", business: rec.recordset[0], 
    //                                 user: record.recordset[0]});
    //                         }
    //                     });
    //                 }
    //             }
    //         });
    //     }
    // })
});

app.post("/manager/login", login_auth, passport.authenticate("manager"), (req, res) =>
{
    res.status(200).json({message: "You are connected"});
    // const { username, password } = req.body;
    // sql.connect(config, (err) =>
    // {
    //     if (err)
    //     {
    //         console.log(err);
    //         res.json({ message: "Could not connect to Database", err});
    //     }
    //     else
    //     {
    //         let request = new sql.Request();
    //         request
    //         .input("username", username)
    //         .input("password", password)
    //         .execute("VerifyManagerLogin", (err, record) => {
    //             if (err)
    //             {
    //                 console.log(err);
    //                 res.status(505).json({ message: "Could not execute query", err});
    //             }
    //             else
    //             {
    //                 if (record.recordsets.length === 0)
    //                     res.status(404).json({ message: "Incorrect Credentials"});
    //                 else
    //                 {
    //                     let store = new sql.Request();
    //                     store
    //                     .input("ManagerID", record.recordset[0].managerID)
    //                     .execute("StoreDetailsOfManagers", (err, rec) =>
    //                     {
    //                         if (err)
    //                         {
    //                             console.log(err)
    //                             res.json({ message: "Could not execute query" });
    //                         }
    //                         else
    //                         {
    //                             console.log(rec);
    //                             if (rec.recordset.length !== 0)
    //                             {
    //                                 let store = new sql.Request();
    //                                 store
    //                                 .input("StoreID", rec.recordset[0].StoreID)
    //                                 .execute("InventoryStockDetails", (err, reco) =>
    //                                 {
    //                                     if (err)
    //                                     {
    //                                         console.log(err)
    //                                         res.json({ message: "Could not execute query" });
    //                                     }
    //                                     else
    //                                     {   
    //                                         req.session.user = record.recordset[0];
    //                                         res.json({ message: "Login successful", Store: rec.recordset[0], 
    //                                             user: record.recordset[0], inventory: reco.recordset});
    //                                     }
    //                                 });
    //                             }
    //                             else
    //                             {
    //                                 req.session.user = record.recordset[0];
    //                                 res.json({ message: "Login successful", Store: rec.recordset[0], 
    //                                     user: record.recordset[0]});
    //                             }
    //                         }
    //                     });
    //                 }
    //             }
    //         });
    //     }
    // })
});

const get_req = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 1
});

app.get("/owner/stores", get_req, (req, res) =>
{

});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

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
    catch(err) {
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
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Database Error", err});
    }
});

const add_sto = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 3
});

app.post("/owner/add_store", add_sto, auth_owner, async (req, res) => {
    const {name, address} = req.body;
    const businessID = req.user.user_id;
    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input("StoreName", name)
        .input("BusinessID", businessID)
        .input("StoreAddress", address)
        .execute("insert_Stores");
        res.json({message: "It was added successfully"});
    }
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

const add_pro = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 4
});

app.post("/owner/add_product", add_pro, auth_owner, async (req, res) =>
{
    const {name, category, price} = req.body;
    const businessID = req.user.user_id;
    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input("ProductName", name)
        .input("BusinessID", businessID)
        .input("Category", category)
        .input("PricePerUnit", price)
        .execute("insert_Products");
        res.json({message: "It was added successfully"});
    }
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

const add_inventory = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 2
});

app.post("/add_inventory", add_inventory, auth_both, async (req, res) =>
{
    // Add Authentication that product and warehouse are of store owner / manager
    const {productID, warehouseID} = req.body;
    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input("ProductID", productID)
        .input("WarehouseID", warehouseID)
        .execute("insert_ProductinWarehouse");
        res.json({message: "It was added successfully"});
    }
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

const add_stock = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 4
});

app.post("/add_stockreq", add_stock, auth_both, async (req, res) =>
{
    // Same authentication as that of above
    const {storeID, productID, quantity, message} = req.body;
    try {
        const pool = await sql.connect(config);
        await pool.request()
        .input("ProductID", productID)
        .input("RequestingStoreID", storeID)
        .input("RequestedQuantity", quantity)
        .input("message", message)
        .execute("insert_StockRequests");
        res.json({message: "It was added successfully"});
    }
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

app.delete("/owner/store/:id", auth_owner, async(req, res) =>
{
    // Verify that stores belong to owner
    const {id} = req.params;
    try {
        const pool = await sql.connect(config);
        const record = await pool.request()
        .input("StoreID", id)
        .execute("delete_store");
        if (record.rowsAffected[0] === 0)
            res.status(404).json({ message: "Store Not found"});
        else
            res.json({ message: "It was deleted successfully"});
    }
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

app.delete("/owner/product/:id", auth_owner, async (req, res) =>
{    
    // Same check as above
    const { id } = req.params;
    try {
        const pool = await sql.connect(config);
        const record = await pool.request()
        .input("ProductID", id)
        .execute("delete_product");
        if (record.rowsAffected[0] === 0)
            res.status(404).json({ message: "Product Not found"});
        else
            res.json({ message: "It was deleted successfully"});
    }
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

app.delete("/stock_req/:id", auth_both, async (req, res) =>
{ 
    // Check if ID related to manager / owner
    const { id } = req.params;
    try {
        const pool = await sql.connect(config);
        const record = await pool.request()
        .input("RequestID", id)
        .execute("Cancel_StockRequest");
        if (record.rowsAffected[0] === 0)
            res.status(404).json({ message: "Stock Request Not found"});
        else
            res.json({ message: "It was deleted successfully"});
    }
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

    
app.delete("/owner/sto_manager/:id", auth_owner, async (req, res) =>
{
    const { id } = req.params;
    // Check if ID related to owner
    try {
        const pool = await sql.connect(config);
        const record = await pool.request()
        .input("ManagerID", id)
        .execute("delete_manager_withNoAssignedStore");
        if (record.rowsAffected[0] === 0)
            res.status(404).json({ message: "Manager Not found"});
        else
            res.json({ message: "Store Manager was deleted successfully"}); 
    }
    catch(err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

app.delete("/owner/notification", auth_owner, async (req, res) =>
{
    const { id } = req.user.user_id; 
    try {
        const pool = await sql.connect(config);
        const record = await pool.request()
        .input("ownerID", id)
        .execute("Remove_Read_Notifications");

        if (record.rowsAffected[0] === 0)
            res.status(404).json({ message: "No read Notifiactions Found"});
        else                        
            res.json({ message: "Notification was deleted successfully"});
    }
    catch (err) {
        console.log(err);
        res.status(505).json({ message: "Could not execute", err});
    }
});

const login_auth = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 2
});

app.post("/owner/login", login_auth, passport.authenticate("owner"), (req, res) =>
{
    res.status(200).json({message: "You are connected"});
});

app.post("/manager/login", login_auth, passport.authenticate("manager"), (req, res) =>
{
    res.status(200).json({message: "You are connected"});
});

const get_req = express.urlencoded({ 
    extended : false,
    limit: 10000,
    parameterLimit: 1
});

app.post("/logout", auth_both, (req, res) => {
    console.log(req.session);
    req.logout(err => {
        if (err) 
            return res.sendStatus(400);
		res.sendStatus(200);
    })
})

app.get("/owner/stores", get_req, (req, res) =>
{

});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

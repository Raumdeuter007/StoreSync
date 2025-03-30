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
                    user_id: result.recordset[0].managerID, 
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
        if (req.user.role === 'owner') {
            const prods = await pool.request()
            .input("id", req.user.user_id)
            .query("SELECT * FROM Products WHERE BusinessID = @id");
            if (prods.recordset.length === 0)
                throw "There are no products registered with the business";

            let flag = false;
            for (let i = 0; !flag && i < prods.recordset.length; i++) {
                if (prods.recordset[i].ProductID === Number(productID)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Product is not included in the business";

            const mans = await pool.request()
            .input("OwnerID", req.user.user_id)
            .execute("StoresWarehouse_ofOwner");

            if (mans.recordset.length === 0)
                throw "No stores found";
            
            flag = false;
            for (let i = 0; !flag && i < mans.recordset.length; i++) {
                if (mans.recordset[i].StoreID === Number(warehouseID)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Store is not included in the business";
        }
        else {
            const store = await pool.request()
            .input("id", req.user.user_id)
            .query("SELECT * FROM Stores WHERE ManagerID = @id");

            if (store.recordset.length === 0)
                throw "No stores found";
            if (store.recordset[0].StoreID !== Number(warehouseID))
                throw "You do not have permission for other stores";

            let b_id = store.recordset[0].BusinessID;
            const prods = await pool.request()
            .input("id", b_id)
            .query("SELECT * FROM Products WHERE BusinessID = @id");
            if (prods.recordset.length === 0)
                throw "There are no products registered with the business";

            let flag = false;
            for (let i = 0; !flag && i < prods.recordset.length; i++) {
                if (prods.recordset[i].ProductID === Number(productID)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Product is not included in the business";
        }
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
        if (req.user.role === 'owner') {
            const prods = await pool.request()
            .input("id", req.user.user_id)
            .query("SELECT * FROM Products WHERE BusinessID = @id");
            if (prods.recordset.length === 0)
                throw "There are no products registered with the business";

            let flag = false;
            for (let i = 0; !flag && i < prods.recordset.length; i++) {
                if (prods.recordset[i].ProductID === Number(productID)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Product is not included in the business";

            const mans = await pool.request()
            .input("OwnerID", req.user.user_id)
            .execute("StoresWarehouse_ofOwner");

            if (mans.recordset.length === 0)
                throw "No stores found";
            
            flag = false;
            for (let i = 0; !flag && i < mans.recordset.length; i++) {
                if (mans.recordset[i].StoreID === Number(storeID)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Store is not included in the business";
        }
        else {
            const store = await pool.request()
            .input("id", req.user.user_id)
            .query("SELECT * FROM Stores WHERE ManagerID = @id");
            console.log(store);
            if (store.recordset.length === 0)
                throw "No stores found";
            if (store.recordset[0].StoreID !== Number(storeID))
                throw "You do not have permission for other stores";

            let b_id = store.recordset[0].BusinessID;
            const prods = await pool.request()
            .input("id", b_id)
            .query("SELECT * FROM Products WHERE BusinessID = @id");
            if (prods.recordset.length === 0)
                throw "There are no products registered with the business";

            let flag = false;
            for (let i = 0; !flag && i < prods.recordset.length; i++) {
                if (prods.recordset[i].ProductID === Number(productID)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Product is not included in the business";
        }
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
        const mans = await pool.request()
        .input("OwnerID", req.user.user_id)
        .execute("StoresWarehouse_ofOwner");

        if (mans.recordset.length === 0)
            throw "No stores found";
        
        let flag = false;
        for (let i = 0; !flag && i < mans.recordset.length; i++) {
            if (mans.recordset[i].StoreID === Number(id)) {
                flag = true;
            }
        }
        if (!flag)
            throw "Store is not included in the business";

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
        const mans = await pool.request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Products WHERE businessID = @id");
        if (mans.recordset.length === 0)
            throw "Product Not found";
        let flag = false;
        for (let i = 0; !flag && i < mans.recordset.length; i++)
        {
            if (mans.recordset[i].ProductID === Number(id))
            {
                flag = true;
            }
        }
        if (!flag)
            throw "Product is not included in the business";

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
        if (req.user.role === 'owner')
        {
            const mans = await pool.request()
            .input("OwnerID", req.user.user_id)
            .execute("StockRequestsForOwner");
    
            if (mans.recordset.length === 0)
                throw "Stock Request not found for the owner";

            let flag = false;
            for (let i = 0; !flag && i < mans.recordset.length; i++)
            {
                if (mans.recordset[i].RequestID === Number(id))
                {
                    flag = true;
                }
            }
            if (!flag)
                throw "Stock Request not included in the business";
        }
        else {
            const store = await pool.request()
            .input("ManagerID", req.user.user_id)
            .execute("StoreDetailsOfManagers");

            if (store.recordset.length === 0)
                throw "Manager has not been assigned a store";
            
            const reqs = await pool.request()
            .input("id", stores.recordset[0].StoreID)
            .query("SELECT * FROM StockRequests WHERE RequestingStoreID = @id");
            
            if (reqs.rowsAffected.length === 0)
                throw "No stock requests for the store";

            let flag = false;
            for (let i = 0; !flag && i < reqs.recordset.length; i++) {
                if (mans.recordset[i].RequestID === Number(id)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Stock Request not included in the business";
        }
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
        const mans = await pool.request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Managers WHERE businessID = @id");

        if (mans.recordset.length === 0)
            throw "Manager Not found";
        let flag = false;
        for (let i = 0; !flag && i < mans.recordset.length; i++)
        {
            if (mans.recordset[i].managerID === Number(id))
            {
                flag = true;
            }
        }
        if (!flag)
            throw "Manager is not included in the business";
            
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
    const id = req.user.user_id;
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

app.get("/owner", auth_owner, async(req,res) => {
    try {
        const id = req.user.user_id;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("OwnerID", sql.Int, id)
            .execute("Business_detailOfOwner");
        
        res.json(result.recordset);
    } 
    catch (err) {
        res.status(500).json({error: err.message});
    }
});


app.get("/manager", auth_man, async(req,res) => {
    try {
        const id = req.user.user_id;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("ManagerID", sql.Int, id)
            .execute("StoreDetailsOfManagers");
    
        res.json(result.recordset);
    } 
    catch (err) {
        res.status(500).json({error: err.message});
    }


});

app.get("/manager/stockReq", auth_man, async(req,res) => {
    try {
        const id = req.user.user_id;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("StoreID", sql.Int, id)
            .execute("stockRequestsOfStore");
    
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }
});

app.get("/owner/stockReq", auth_owner, async(req,res) => {
    try{
        const id = req.user.user_id;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("OwnerID", sql.Int, id)
            .execute("StockRequestsForOwner");
    
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }
});

// Get Stock Request for a specific store
app.get("/owner/stockReq/:id", auth_owner, async(req,res) => {
    try{
        const o_id = req.user.user_id;
        const { id } = req.params;
        const pool = await sql.connect(config);
        const mans = await pool.request()
        .input("OwnerID", o_id)
        .execute("StoresWarehouse_ofOwner");

        if (mans.recordset.length === 0)
            throw "No stores found";
        
        let flag = false;
        for (let i = 0; !flag && i < mans.recordset.length; i++) {
            if (mans.recordset[i].StoreID === Number(id)) {
                flag = true;
            }
        }
        if (!flag)
            throw "Store is not included in the business";

        const result = await pool
            .request()
            .input("StoreID", sql.Int, id)
            .execute("stockRequestsOfStore");
    
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }
});

// Get Stock of Product in a specific warehouse
app.get("/stockDetails/:w_id/:p_id", auth_both, async(req,res) => {
    try{
        const {w_id, p_id} = req.params;
        const pool = await sql.connect(config);
        if (req.user.role === 'owner') {
            const prods = await pool.request()
            .input("id", req.user.user_id)
            .query("SELECT * FROM Products WHERE BusinessID = @id");
            if (prods.recordset.length === 0)
                throw "There are no products registered with the business";

            let flag = false;
            for (let i = 0; !flag && i < prods.recordset.length; i++) {
                if (prods.recordset[i].ProductID === Number(p_id)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Product is not included in the business";

            const mans = await pool.request()
            .input("OwnerID", req.user.user_id)
            .execute("StoresWarehouse_ofOwner");

            if (mans.recordset.length === 0)
                throw "No stores found";
            
            flag = false;
            for (let i = 0; !flag && i < mans.recordset.length; i++) {
                if (mans.recordset[i].StoreID === Number(w_id)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Store is not included in the business";
        }
        else {
            const store = await pool.request()
            .input("id", req.user.user_id)
            .query("SELECT * FROM Stores WHERE ManagerID = @id");

            if (store.recordset.length === 0)
                throw "No stores found";
            if (store.recordset[0].StoreID !== Number(w_id))
                throw "You do not have permission for other stores";

            let b_id = store.recordset[0].BusinessID;
            const prods = await pool.request()
            .input("id", b_id)
            .query("SELECT * FROM Products WHERE BusinessID = @id");
            if (prods.recordset.length === 0)
                throw "There are no products registered with the business";

            let flag = false;
            for (let i = 0; !flag && i < prods.recordset.length; i++) {
                if (prods.recordset[i].ProductID === Number(p_id)) {
                    flag = true;
                }
            }
            if (!flag)
                throw "Product is not included in the business";
        }
        const result = await pool
            .request()
            .input("WarehouseID", sql.Int, w_id)
            .input("ProductID", sql.Int, p_id)
            .execute("StockDetails");
        
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({ message: "Can not execute", error: err.message});
    }
});

app.get("/manager/CompletedReqsPastyear", auth_man, async(req,res) => {
    try {
        const id = req.user.user_id;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("ManagerID", sql.Int, id) 
            .execute("CompletedReqsPastyear");
        
        res.json(result.recordset);
    } 
    catch (err) {
        res.status(500).json({error: err.message});
    }
});


app.get("/manager/CompletedReqsInTimePeriod/:sPeriod/:ePeriod", auth_man, async(req,res) => {
    try {
        const {sPeriod, ePeriod} = req.params;
        const id = req.user.user_id;
        const pool = await sql.connect(config);
        
        const startDate = new Date(sPeriod);
        const endDate = new Date(ePeriod);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ error: "Invalid date format." });
        }

        const result = await pool
            .request()
            .input("ManagerID", sql.Int, id)
            .input("PeriodStart", sql.DateTime, startDate)
            .input("PeriodEnd", sql.DateTime, endDate) 
            .execute("CompletedReqsInTimePeriod");
        
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }
});


app.get("/TopReqestedProdsAtStore_Y/:TopNProdsToRet/:X_Years", auth_man, async(req,res) => {
    try {
        const {TopNProdsToRet, X_Years} = req.params;
        const id = req.user.user_id;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("ManagerID", sql.Int, id)
            .input("TopNProdsToRet", sql.Int, TopNProdsToRet)
            .input("X_Years", sql.Int, X_Years) 
            .execute("TopReqestedProdsAtStore_Y");
    
        res.json(result.recordset);
    } 
    catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get("/TopReqestedProdsAtStore_M/:TopNProdsToRet/:X_Months", auth_man, async(req,res) => {
    try {
        const {TopNProdsToRet, X_Months} = req.params;
        const id = req.user.user_id;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("ManagerID", sql.Int, id)
            .input("TopNProdsToRet", sql.Int, TopNProdsToRet)
            .input("X_Months", sql.Int, X_Months) 
            .execute("TopReqestedProdsAtStore_M");
    
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }
}); 

//VerifyManagerLogin

app.get("/VerifyManagerLogin/:username/:password",async(req,res) => {
    try{
         const {username,password} = req.params;
         const pool = await sql.connect(config);

         const result = await pool
             .request()
             .input("username",sql.VarChar,username)
             .input("password",sql.VarChar,password)
             .query("EXEC VerifyManagerLogin @username,@password ");
        
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
            }
    }); 

//StoresWarehouse_ofOwner

app.get("/StoresWarehouse_ofOwner/:id", async(req,res) => {
    try{
        const {id} = req.params;
        const pool = await sql.connect(config);

         const result = await pool
             .request()
             .input("OwnerID",sql.int,id)
             .query("EXEC StoresWarehouse_ofOwner @OwnerID ");

        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }

});

//InventoryStockDetails

app.get("/InventoryStockDetails/:id", async(req,res) => {
    try{
        const {id} = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("StoreID",sql.Int,id)
            .query("EXEC InventoryStockDetails @StoreID ");

        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }

});

//PendingStockRequests

app.get("/PendingStockRequests/:id",async(req,res) => {
    try{
        const {id} = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("StoreID",sql.Int,id)
            .query("EXEC PendingStockRequests @StoreID ");
        
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }

});

//NotificationsOfStore   <== TODO: Better name and use storeId/ManagerID instead of OwnerId
app.get("/NotificationsOfStore/:id",async(req,res) => {
    try{
        const {id} = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("OwnerID",sql.Int,id)
            .query("EXEC NotificationsOfStore @OwnerID ");
        
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }

});

//GetProductsToReorder

app.get("/GetProductsToReorder/:id",async(req,res) => {
    try{
        const {id} = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("WarehouseId",sql.Int,id)
            .query("EXEC GetProductsToReorder @WarehouseId ");
        
        res.json(result.recordset);
    } catch (err){
        res.status(500).json({error: err.message});
    }

});

//StockAcrossWarehouses

app.get("/StockAcrossWarehouses/:Bid/:Pid", async (req, res) => {
    try {
        const { Bid, Pid } = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("BusinessId", sql.Int, Bid)
            .input("ProductId", sql.Int, Pid)
            .query("EXEC StockAcrossWarehouses @BusinessId, @ProductId");

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//FetchStockRequest
app.get("/FetchStockRequest/:SMid/:Rid", async (req, res) => {
    try {
        const { SMid, Rid } = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("StoreManager", sql.Int, SMid)
            .input("RequestID", sql.Int, Rid)
            .query("EXEC FetchStockRequest @StoreManager, @RequestID");

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//CompletedReqsThisYear
app.get("/CompletedReqsThisYear/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("ManagerID", sql.Int, id)
            .query("EXEC CompletedReqsThisYear @ManagerID");

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//CompletedReqsPastMonth
app.get("/CompletedReqsPastMonth/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("ManagerID", sql.Int, id)
            .query("EXEC CompletedReqsPastMonth @ManagerID");

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//PerformanceCompAcrossQuarters
app.get("/PerformanceCompAcrossQuarters/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(config);

        const result = await pool
            .request()
            .input("ManagerID", sql.Int, id)
            .query("EXEC PerformanceCompAcrossQuarters @ManagerID");

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// app.put("/UpdateOwners/:ColumnName/:NewVal/:OwnerID",async(req,res)=>{
//     try{
//         const {ColumnName,NewVal,OwnerID} = req.params;
//         const pool = await sql.connect(config);
//         const result = await pool
//         .request()
//         .input("ColumnName",sql.VarChar,ColumnName)
//         .input("NewVal",sql.VarChar,NewVal)
//         .input("OwnerId", sql.Int, OwnerID)
//         .query("EXEC UpdateOwners @ColumnName, @NewVal, @OwnerId");


//         res.json(result.recordset);

//     } catch (err){
//         res.status(500).json({error: err.message});
//     }

// });
// app.put("/UpdateBusiness/:ColumnName/:NewVal/:BusinessId",async(req,res)=>{
//     try{
//         const {ColumnName,NewVal,BusinessID} = req.params;
//         const pool = await sql.connect(config);
//         const result = await pool
//         .request()
//         .input("ColumnName",sql.VarChar,ColumnName)
//         .input("NewVal",sql.VarChar,NewVal)
//         .input("BusinessId", sql.Int, BusinessID)
//         .query("EXEC UpdateBusiness @ColumnName, @NewVal, @BusinessId");


//         res.json(result.recordset);

//     } catch (err){
//         res.status(500).json({error: err.message});
//     }

// });

app.put("/owner/UpdatePrice/:NewVal/:ProductID", auth_owner, async(req,res)=>{
    try{
        const {NewVal, ProductID} = req.params;
        const ColumnName = "PricePerUnit";
        const pool = await sql.connect(config);

        const mans = await pool.request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Products WHERE businessID = @id");
        if (mans.recordset.length === 0)
            throw "Product Not found";
        let flag = false;
        for (let i = 0; !flag && i < mans.recordset.length; i++)
        {
            if (mans.recordset[i].ProductID === Number(ProductID))
            {
                flag = true;
            }
        }
        if (!flag)
            throw "Product is not included in the business";

        const result = await pool
        .request()
        .input("ColumnName", sql.VarChar, ColumnName)
        .input("NewVal", sql.VarChar, NewVal)
        .input("ProductID", sql.Int, ProductID)
        .execute("UpdateProducts");

        res.json(result.recordset);

    } catch (err){
        res.status(500).json({error: err.message});
    }
});

// // TODO: Update status to approved, add stock to inventory
// app.put("/owner/stockreq/accept/:id", auth_owner, async (req, res) => {
//     const { id } = req.params;
//     const pool = await sql.connect(config);

//     const res = await pool.request()
//     .input("id", id)
//     .query("SELECT * FROM AStockReqs WHERE RequestID = @id");
    
// });

// app.put("/UpdateInventory/:ColumnName/:NewVal/:WarehouseID/:ProductID",async(req,res)=>{
//     try{
//         const {ColumnName,NewVal,WarehouseID,ProductID} = req.params;
//         const pool = await sql.connect(config);
//         const result = await pool
//         .request()
//         .input("ColumnName",sql.VarChar,ColumnName)
//         .input("NewVal",sql.Int,NewVal)
//         .input("ProductID", sql.Int, ProductID)
//         .input("WarehouseID", sql.Int, WarehouseID)
//         .query("EXEC UpdateInventory @ColumnName, @NewVal,@WarehouseID, @ProductId");


//         res.json(result.recordset);

//     } catch (err){
//         res.status(500).json({error: err.message});
//     }

// });

app.put("/owner/readNotification/:id", auth_owner, async(req,res) => {
    try{
        const { id } = req.params;
        const ColumnName = "ReadStatus";
        const NewVal = 2;
        const pool = await sql.connect(config);
        const all_notes = await pool.request()
        .input("id", id)
        .query("SELECT * FROM Notifications WHERE NotificationID = @id");
        if (all_notes.recordset[0].RecipientUserID !== req.user.user_id)
            throw "Notification is not for this business";

        const result = await pool
        .request()
        .input("ColumnName", sql.VarChar, ColumnName)
        .input("NewVal", sql.Int, NewVal)
        .input("NotificationId", sql.Int, id)
        .execute("UpdateNotifications");

        res.json(result.recordset);

    } catch (err){
        res.status(500).json({error: err.message});
    }
});

// app.put("/UpdateRequestStatus/:ColumnName/:NewVal/:StatusId",async(req,res)=>{
//     try{
//         const {ColumnName,NewVal,StatusId} = req.params;
//         const pool = await sql.connect(config);
//         const result = await pool
//         .request()
//         .input("ColumnName",sql.VarChar,ColumnName)
//         .input("NewVal",sql.Int,NewVal)
//         .input("StatusId", sql.Int, StatusId)
//         .query("EXEC UpdateRequestStatus @ColumnName, @NewVal,@StatusId");


//         res.json(result.recordset);

//     } catch (err){
//         res.status(500).json({error: err.message});
//     }

// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

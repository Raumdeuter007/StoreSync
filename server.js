const express = require("express");
require("dotenv").config();
const sql = require("mssql/msnodesqlv8");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-local");
const helper = require("./helper.js");

const config = {
  connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};
    Database=${process.env.DB_DATABASE};Trusted_Connection=Yes;`,
};

passport.use(
  "owner",
  new Strategy(async (username, password, done) => {
    try {
      const pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("username", username)
        .query("SELECT * FROM Owners WHERE username = @username");

      if (result.recordset.length === 0) return done(null, false);
      else if (
        !(await helper.comparePassword(password, result.recordset[0].password))
      )
        return done(null, false);
      else {
        const dict = {
          user_id: result.recordset[0].ownerID,
          role: "owner",
        };
        return done(null, dict);
      }
    } catch (err) {
      console.log(err);
      done(err, false);
    }
  })
);

passport.use(
  "manager",
  new Strategy(async (username, password, done) => {
    try {
      const pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("username", username)
        .query("SELECT * FROM Managers WHERE username = @username");

      if (result.recordset.length === 0) return done(null, false);
      if (
        !(await helper.comparePassword(password, result.recordset[0].password))
      )
        return done(null, false);

      // console.log(result);
      if (result.recordsets.length === 0) done(null, false);
      else {
        const dict = {
          user_id: result.recordset[0].managerID,
          role: "manager",
        };
        return done(null, dict);
      }
    } catch (err) {
      console.log(err);
      done(err, false);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (login, done) => {
  try {
    const pool = await sql.connect(config);
    if (login.role === "owner") {
      let result = await pool
        .request()
        .input("id", login.user_id)
        .query("SELECT * FROM Owners WHERE ownerid = @id");
      if (result.recordsets.length === 0)
        done(null, false, { message: "No such user" });
      else {
        const dict = {
          user_id: result.recordset[0].ownerID,
          role: "owner",
        };
        done(null, dict);
      }
    } else if (login.role === "manager") {
      let result = await pool
        .request()
        .input("id", login.user_id)
        .query("SELECT * FROM Managers WHERE managerid = @id");
      if (result.recordsets.length === 0)
        done(null, false, { message: "No such user" });
      else {
        const dict = {
          user_id: result.recordset[0].managerID,
          role: "manager",
        };
        done(null, dict);
      }
    }
  } catch (err) {
    console.log(err);
    return done(err, false);
  }
});

const auth_both = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "You are not authorized" });
};

const auth_owner = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "owner") return next();
  return res.status(401).json({ message: "You are not authorized" });
};

const auth_man = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "manager") return next();
  return res.status(401).json({ message: "You are not authorized" });
};

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // adjust this if your frontend runs on a different port
    credentials: true,
  })
);
const reg_bus = express.urlencoded({
  extended: false,
  limit: 10000,
  parameterLimit: 6,
});

app.use(
  session({
    secret: "H9b4fV6RZT7TgPEmdZ4IdRh5me7Tv01o",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60, // Cookie Time 1 hr
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// app.get("/", function (req, res) {
//   sql.connect(config, function (err) {
//     if (err) console.log(err);
//     else {
//       let request = new sql.Request();
//       request.query("SELECT * FROM Managers", (err, record) => {
//         if (err) console.log(err);
//         else console.log(record);
//       });
//     }
//   });
//   res.end("It worked!");
// });

app.post("/owner/register", reg_bus, async (req, res) => {
  const { name, email, username, password, business, address } = req.body;
  try {
    const pool = await sql.connect(config);
    const hashed = await helper.hashPassword(password);
    await pool
      .request()
      .input("O_name", name)
      .input("O_email", email)
      .input("O_username", username)
      .input("O_password", hashed)
      .input("BusinessName", business)
      .input("HQAddress", address)
      .execute("insert_OwnersAndBusiness");
    res.json({ message: "It was added successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Database Error", err });
  }
});

const reg_man = express.urlencoded({
  extended: false,
  limit: 10000,
  parameterLimit: 5,
});

app.post("/manager/register", reg_man, async (req, res) => {
  const { name, email, username, password, businessID } = req.body;
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input("name", name)
      .input("email", email)
      .input("username", username)
      .input("password", password)
      .input("BusinessID", businessID)
      .execute("insert_Managers");
    res.json({ message: "It was added successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Database Error", err });
  }
});

const add_sto = express.urlencoded({
  extended: false,
  limit: 10000,
  parameterLimit: 3,
});

app.post("/owner/add_store", add_sto, auth_owner, async (req, res) => {
  const { name, address } = req.body;
  const businessID = req.user.user_id;
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input("StoreName", name)
      .input("BusinessID", businessID)
      .input("StoreAddress", address)
      .execute("insert_Stores");
    res.json({ message: "It was added successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

const add_pro = express.urlencoded({
  extended: false,
  limit: 10000,
  parameterLimit: 4,
});

app.post("/owner/add_product", add_pro, auth_owner, async (req, res) => {
  const { name, category, price } = req.body;
  const businessID = req.user.user_id;
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input("ProductName", name)
      .input("BusinessID", businessID)
      .input("Category", category)
      .input("PricePerUnit", price)
      .execute("insert_Products");
    res.json({ message: "It was added successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

const add_inventory = express.urlencoded({
  extended: false,
  limit: 10000,
  parameterLimit: 2,
});

app.post("/add_inventory", add_inventory, auth_both, async (req, res) => {
  // Add Authentication that product and warehouse are of store owner / manager
  const { productID, warehouseID } = req.body;
  try {
    const pool = await sql.connect(config);
    if (req.user.role === "owner") {
      const prods = await pool
        .request()
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
      if (!flag) throw "Product is not included in the business";

      const mans = await pool
        .request()
        .input("OwnerID", req.user.user_id)
        .execute("StoresWarehouse_ofOwner");

      if (mans.recordset.length === 0) throw "No stores found";

      flag = false;
      for (let i = 0; !flag && i < mans.recordset.length; i++) {
        if (mans.recordset[i].StoreID === Number(warehouseID)) {
          flag = true;
        }
      }
      if (!flag) throw "Store is not included in the business";
    } else {
      const store = await pool
        .request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Stores WHERE ManagerID = @id");

      if (store.recordset.length === 0) throw "No stores found";
      if (store.recordset[0].StoreID !== Number(warehouseID))
        throw "You do not have permission for other stores";

      let b_id = store.recordset[0].BusinessID;
      const prods = await pool
        .request()
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
      if (!flag) throw "Product is not included in the business";
    }
    await pool
      .request()
      .input("ProductID", productID)
      .input("WarehouseID", warehouseID)
      .execute("insert_ProductinWarehouse");
    res.json({ message: "It was added successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

const add_stock = express.urlencoded({
  extended: false,
  limit: 10000,
  parameterLimit: 4,
});

app.post("/add_stockreq", add_stock, auth_both, async (req, res) => {
  // Same authentication as that of above
  const { storeID, productID, quantity, message } = req.body;
  try {
    const pool = await sql.connect(config);
    if (req.user.role === "owner") {
      const prods = await pool
        .request()
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
      if (!flag) throw "Product is not included in the business";

      const mans = await pool
        .request()
        .input("OwnerID", req.user.user_id)
        .execute("StoresWarehouse_ofOwner");

      if (mans.recordset.length === 0) throw "No stores found";

      flag = false;
      for (let i = 0; !flag && i < mans.recordset.length; i++) {
        if (mans.recordset[i].StoreID === Number(storeID)) {
          flag = true;
        }
      }
      if (!flag) throw "Store is not included in the business";
    } else {
      const store = await pool
        .request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Stores WHERE ManagerID = @id");
      if (store.recordset.length === 0) throw "No stores found";
      if (store.recordset[0].StoreID !== Number(storeID))
        throw "You do not have permission for other stores";

      let b_id = store.recordset[0].BusinessID;
      const prods = await pool
        .request()
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
      if (!flag) throw "Product is not included in the business";
    }
    await pool
      .request()
      .input("ProductID", productID)
      .input("RequestingStoreID", storeID)
      .input("RequestedQuantity", quantity)
      .input("message", message)
      .execute("insert_StockRequests");
    res.json({ message: "It was added successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

app.delete("/owner/store/:id", auth_owner, async (req, res) => {
  // Verify that stores belong to owner
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    const mans = await pool
      .request()
      .input("OwnerID", req.user.user_id)
      .execute("StoresWarehouse_ofOwner");

    if (mans.recordset.length === 0) throw "No stores found";

    let flag = false;
    for (let i = 0; !flag && i < mans.recordset.length; i++) {
      if (mans.recordset[i].StoreID === Number(id)) {
        flag = true;
      }
    }
    if (!flag) throw "Store is not included in the business";

    const record = await pool
      .request()
      .input("StoreID", id)
      .execute("delete_store");
    if (record.rowsAffected[0] === 0)
      res.status(404).json({ message: "Store Not found" });
    else res.json({ message: "It was deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

app.delete("/owner/product/:id", auth_owner, async (req, res) => {
  // Same check as above
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    const mans = await pool
      .request()
      .input("id", req.user.user_id)
      .query("SELECT * FROM Products WHERE businessID = @id");
    if (mans.recordset.length === 0) throw "Product Not found";
    let flag = false;
    for (let i = 0; !flag && i < mans.recordset.length; i++) {
      if (mans.recordset[i].ProductID === Number(id)) {
        flag = true;
      }
    }
    if (!flag) throw "Product is not included in the business";

    const record = await pool
      .request()
      .input("ProductID", id)
      .execute("delete_product");
    if (record.rowsAffected[0] === 0)
      res.status(404).json({ message: "Product Not found" });
    else res.json({ message: "It was deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

app.delete("/stock_req/:id", auth_both, async (req, res) => {
  // Check if ID related to manager / owner
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    if (req.user.role === "owner") {
      const mans = await pool
        .request()
        .input("OwnerID", req.user.user_id)
        .execute("StockRequestsForOwner");

      if (mans.recordset.length === 0)
        throw "Stock Request not found for the owner";

      let flag = false;
      for (let i = 0; !flag && i < mans.recordset.length; i++) {
        if (mans.recordset[i].RequestID === Number(id)) {
          flag = true;
        }
      }
      if (!flag) throw "Stock Request not included in the business";
    } else {
      const store = await pool
        .request()
        .input("ManagerID", req.user.user_id)
        .execute("StoreDetailsOfManagers");

      if (store.recordset.length === 0)
        throw "Manager has not been assigned a store";

      const reqs = await pool
        .request()
        .input("id", stores.recordset[0].StoreID)
        .query("SELECT * FROM StockRequests WHERE RequestingStoreID = @id");

      if (reqs.rowsAffected.length === 0)
        throw "No stock requests for the store";

      let flag = false;
      for (let i = 0; !flag && i < reqs.recordset.length; i++) {
        if (reqs.recordset[i].RequestID === Number(id)) {
          flag = true;
        }
      }
      if (!flag) throw "Stock Request not included in the business";
    }
    const record = await pool
      .request()
      .input("RequestID", id)
      .execute("Cancel_StockRequest");

    if (record.rowsAffected[0] === 0)
      res.status(404).json({ message: "Stock Request Not found" });
    else res.json({ message: "It was deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

app.delete("/owner/sto_manager/:id", auth_owner, async (req, res) => {
  const { id } = req.params;
  // Check if ID related to owner
  try {
    const pool = await sql.connect(config);
    const mans = await pool
      .request()
      .input("id", req.user.user_id)
      .query("SELECT * FROM Managers WHERE businessID = @id");

    if (mans.recordset.length === 0) throw "Manager Not found";
    let flag = false;
    for (let i = 0; !flag && i < mans.recordset.length; i++) {
      if (mans.recordset[i].managerID === Number(id)) {
        flag = true;
      }
    }
    if (!flag) throw "Manager is not included in the business";

    const record = await pool
      .request()
      .input("id", id)
      .query("UPDATE Stores SET ManagerID = NULL WHERE ManagerID = @id");
    if (record.rowsAffected[0] === 0)
      res.status(404).json({ message: "Manager Not found" });
    else res.json({ message: "Store Manager was deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

app.delete("/owner/notification", auth_owner, async (req, res) => {
  const id = req.user.user_id;
  try {
    const pool = await sql.connect(config);
    const record = await pool
      .request()
      .input("ownerID", id)
      .execute("Remove_Read_Notifications");

    if (record.rowsAffected[0] === 0)
      res.status(404).json({ message: "No read Notifiactions Found" });
    else res.json({ message: "Notification was deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(505).json({ message: "Could not execute", err });
  }
});

const login_auth = express.urlencoded({
  extended: false,
  limit: 10000,
  parameterLimit: 2,
});

app.post(
  "/owner/login",
  login_auth,
  passport.authenticate("owner"),
  (req, res) => {
    if (!res.headersSent)
      res.status(200).json({ message: "You are connected" });
  }
);

app.post(
  "/manager/login",
  login_auth,
  passport.authenticate("manager"),
  (req, res) => {
    if (!res.headersSent)
      res.status(200).json({ message: "You are connected" });
  }
);

app.post("/logout", auth_both, (req, res) => {
  req.logout((err) => {
    if (err) return res.sendStatus(400);
    res.sendStatus(200);
  });
});

app.get("/owner", auth_owner, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("OwnerID", sql.Int, id)
      .execute("Business_detailOfOwner");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.get("/manager", auth_man, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("ManagerID", sql.Int, id)
      .execute("StoreDetailsOfManagers");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.get("/products", auth_both, async (req, res) => {
  try {
    if (req.user.role === "owner") {
      const pool = await sql.connect(config);
      const prods = await pool
        .request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Products WHERE BusinessID = @id");
      res.json(prods.recordset);
    } else {
      const pool = await sql.connect(config);
      const store = await pool
        .request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Stores WHERE ManagerID = @id");

      if (store.recordset.length === 0) throw "No stores found";
      let b_id = store.recordset[0].BusinessID;
      const prods = await pool
        .request()
        .input("id", b_id)
        .query("SELECT * FROM Products WHERE BusinessID = @id");
      res.json(prods.recordset);
    }
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.get("/manager/stockReq", auth_man, async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const store = await pool
      .request()
      .input("id", req.user.user_id)
      .query("SELECT * FROM Stores WHERE ManagerID = @id");

    if (store.recordset.length === 0) throw "No stores found";

    const id = store.recordset[0].StoreID;
    const result = await pool
      .request()
      .input("StoreID", sql.Int, id)
      .execute("stockRequestsOfStore");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.get("/owner/stockReq", auth_owner, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("OwnerID", sql.Int, id)
      .execute("StockRequestsForOwner");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

// Get Stock Request for a specific store
app.get("/owner/stockReq/:id", auth_owner, async (req, res) => {
  try {
    const o_id = req.user.user_id;
    const { id } = req.params;
    const pool = await sql.connect(config);
    const mans = await pool
      .request()
      .input("OwnerID", o_id)
      .execute("StoresWarehouse_ofOwner");

    if (mans.recordset.length === 0) throw "No stores found";
    console.log(mans);

    let flag = false;
    for (let i = 0; !flag && i < mans.recordset.length; i++) {
      if (mans.recordset[i].StoreID === Number(id)) {
        flag = true;
      }
    }
    if (!flag) throw "Store is not included in the business";

    const result = await pool
      .request()
      .input("StoreID", sql.Int, id)
      .execute("stockRequestsOfStore");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

// Get Stock of Product in a specific warehouse
app.get("/stockDetails/:w_id/:p_id", auth_both, async (req, res) => {
  try {
    const { w_id, p_id } = req.params;
    const pool = await sql.connect(config);
    if (req.user.role === "owner") {
      const prods = await pool
        .request()
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
      if (!flag) throw "Product is not included in the business";

      const mans = await pool
        .request()
        .input("OwnerID", req.user.user_id)
        .execute("StoresWarehouse_ofOwner");

      if (mans.recordset.length === 0) throw "No stores found";

      flag = false;
      for (let i = 0; !flag && i < mans.recordset.length; i++) {
        if (mans.recordset[i].StoreID === Number(w_id)) {
          flag = true;
        }
      }
      if (!flag) throw "Store is not included in the business";
    } else {
      const store = await pool
        .request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Stores WHERE ManagerID = @id");

      if (store.recordset.length === 0) throw "No stores found";
      if (store.recordset[0].StoreID !== Number(w_id))
        throw "You do not have permission for other stores";

      let b_id = store.recordset[0].BusinessID;
      const prods = await pool
        .request()
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
      if (!flag) throw "Product is not included in the business";
    }
    const result = await pool
      .request()
      .input("WarehouseID", sql.Int, w_id)
      .input("ProductID", sql.Int, p_id)
      .execute("StockDetails");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Can not execute", err });
  }
});

app.get("/manager/CompletedReqsPastyear", auth_man, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("ManagerID", sql.Int, id)
      .execute("CompletedReqsPastyear");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.get(
  "/manager/CompletedReqsInTimePeriod/:sPeriod/:ePeriod",
  auth_man,
  async (req, res) => {
    try {
      const { sPeriod, ePeriod } = req.params;
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
    } catch (err) {
      res.status(500).json({ err });
    }
  }
);

app.get(
  "/manager/TopReqestedProdsAtStore_Y/:TopNProdsToRet/:X_Years",
  auth_man,
  async (req, res) => {
    try {
      const { TopNProdsToRet, X_Years } = req.params;
      const id = req.user.user_id;
      const pool = await sql.connect(config);

      const result = await pool
        .request()
        .input("ManagerID", sql.Int, id)
        .input("TopNProdsToRet", sql.Int, TopNProdsToRet)
        .input("X_Years", sql.Int, X_Years)
        .execute("TopReqestedProdsAtStore_Y");

      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ err });
    }
  }
);

app.get(
  "/manager/TopReqestedProdsAtStore_M/:TopNProdsToRet/:X_Months",
  auth_man,
  async (req, res) => {
    try {
      const { TopNProdsToRet, X_Months } = req.params;
      const id = req.user.user_id;
      const pool = await sql.connect(config);

      const result = await pool
        .request()
        .input("ManagerID", sql.Int, id)
        .input("TopNProdsToRet", sql.Int, TopNProdsToRet)
        .input("X_Months", sql.Int, X_Months)
        .execute("TopReqestedProdsAtStore_M");

      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ err });
    }
  }
);

app.get("/manager/store", auth_man, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("ManagerID", sql.Int, id)
      .query(
        "SELECT StoreID, StoreName FROM Stores WHERE ManagerID = @ManagerID"
      );

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

//StoresWarehouse_ofOwner

app.get("/owner/store", auth_owner, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("OwnerID", sql.Int, id)
      .execute("StoresWarehouse_ofOwner");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.get("/owner/stores", auth_owner, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("BusinessID", sql.Int, id)
      .execute("BusinessStoreSummary");

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.get("/owner/managers", auth_owner, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("BusinessID", sql.Int, id)
      .query("SELECT * FROM Managers WHERE BusinessID = @BusinessID");

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});
// InventoryStockDetails

app.get("/manager/inventory", auth_man, async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const store = await pool
      .request()
      .input("id", req.user.user_id)
      .query("SELECT * FROM Stores WHERE ManagerID = @id");

    if (store.recordset.length === 0)
      throw "No stores found assigned to the manager";

    const id = store.recordset[0].StoreID;
    const result = await pool
      .request()
      .input("StoreID", sql.Int, id)
      .execute("InventoryStockDetails");

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.get("/owner/inventory", auth_owner, async (req, res) => {
  try {
    const ownerId = req.user.user_id; // Get owner ID from authenticated user
    const pool = await sql.connect(config);

    // Step 1: Get all stores associated with the owner's business
    const storesResult = await pool
      .request()
      .input("OwnerID", sql.Int, ownerId)
      .execute("StoresWarehouse_ofOwner"); // This SP gets stores for an owner

    if (!storesResult.recordset || storesResult.recordset.length === 0) {
      // If the owner has no stores, return an empty array
      return res.json([]);
    }

    const allInventoryDetails = [];

    // Step 2: Iterate through each store and get its inventory details
    for (const store of storesResult.recordset) {
      const storeId = store.StoreID;
      const storeName = store.StoreName; // Keep store name for context

      // Execute InventoryStockDetails for the current store ID
      const inventoryResult = await pool
        .request()
        .input("StoreID", sql.Int, storeId)
        .execute("InventoryStockDetails"); // This SP gets inventory for a specific store

      // Add store context (ID and Name) to each inventory item before adding to the main list
      const inventoryWithContext = inventoryResult.recordset.map((item) => ({
        ...item, // Spread existing item properties (ProductID, ProductName, stockQuantity)
        StoreID: storeId,
        StoreName: storeName,
      }));

      // Add the inventory details for the current store to the aggregate list
      allInventoryDetails.push(...inventoryWithContext);
    }

    // Step 3: Return the aggregated inventory details from all stores
    res.json(allInventoryDetails);
  } catch (err) {
    console.error("Error fetching inventory for owner:", err); // Log the error for debugging
    // Send a generic server error response
    res.status(500).json({
      error: "Failed to retrieve inventory details.",
      details: err.message,
    });
  }
});

// PendingStockRequests

app.get("/PendingStockRequests", auth_both, async (req, res) => {
  try {
    const pool = await sql.connect(config);
    let id;
    if (req.user.role === "owner") {
      const all_store = await pool
        .request()
        .input("OwnerID", sql.Int, req.user.user_id)
        .execute("StoresWarehouse_ofOwner");
      id = all_store.recordset.map((c) => c.StoreID);
      const all_result = [];
      for (let i = 0; i < id.length; i++) {
        const inte = await pool
          .request()
          .input("StoreID", sql.Int, id[i])
          .execute("PendingStockRequests");
        for (let j = 0; j < inte.recordset.length; j++)
          all_result.push(inte.recordset[j]);
      }
      res.json(all_result);
    } else {
      const store = await pool
        .request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Stores WHERE ManagerID = @id");
      if (store.recordset.length === 0)
        throw "No stores found assigned to the manager";
      id = store.recordset[0].StoreID;
      const result = await pool
        .request()
        .input("StoreID", sql.Int, id)
        .query("EXEC PendingStockRequests @StoreID");

      res.json(result.recordset);
    }
  } catch (err) {
    res.status(500).json({ err });
  }
});

// NotificationsOfStore   <== TODO: Better name and use storeId/ManagerID instead of OwnerId
app.get("/owner/Notifications", auth_owner, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("OwnerID", sql.Int, id)
      .query("EXEC NotificationsOfStore @OwnerID ");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

// GetProductsToReorder

app.get("/manager/ReorderProds", auth_man, async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const store = await pool
      .request()
      .input("id", req.user.user_id)
      .query("SELECT * FROM Stores WHERE ManagerID = @id");
    if (store.recordset.length === 0)
      throw "No stores found assigned to the manager";

    const id = store.recordset[0].StoreID;
    const result = await pool
      .request()
      .input("WarehouseId", sql.Int, id)
      .execute("GetProductsToReorder");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

// StockAcrossWarehouses

app.get("/owner/StockAcrossWarehouses/:Pid", auth_owner, async (req, res) => {
  try {
    const { Pid } = req.params;
    const pool = await sql.connect(config);

    const prods = await pool
      .request()
      .input("id", req.user.user_id)
      .query("SELECT * FROM Products WHERE businessID = @id");
    if (prods.recordset.length === 0) throw "Product Not found";

    let flag = false;
    for (let i = 0; !flag && i < prods.recordset.length; i++) {
      if (prods.recordset[i].ProductID === Number(Pid)) {
        flag = true;
      }
    }
    if (!flag) throw "Product is not included in the business";

    const Bid = req.user.user_id;
    const result = await pool
      .request()
      .input("BusinessId", sql.Int, Bid)
      .input("ProductId", sql.Int, Pid)
      .execute("StockAcrossWarehouses");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

// FetchStockRequest
app.get("/manager/FetchStockRequest/:Rid", auth_man, async (req, res) => {
  try {
    const { Rid } = req.params;
    const SMid = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("StoreManager", sql.Int, SMid)
      .input("RequestID", sql.Int, Rid)
      .execute("FetchStockRequest");
    if (result.recordset.length === 0) throw "Stock Request Not found";

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.get("/business", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query("SELECT BusinessID, BusinessName FROM Business");
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

// CompletedReqsThisYear
app.get("/manager/CompletedReqsThisYear", auth_man, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("ManagerID", sql.Int, id)
      .execute("CompletedReqsThisYear");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

// CompletedReqsPastMonth
app.get("/manager/CompletedReqsPastMonth", auth_man, async (req, res) => {
  try {
    const id = req.user.user_id;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("ManagerID", sql.Int, id)
      .query("EXEC CompletedReqsPastMonth @ManagerID");

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ err });
  }
});

// PerformanceCompAcrossQuarters
// app.get("/manager/PerformanceCompAcrossQuarters", auth_man, async (req, res) => {
//     try {
//         const id = req.user.user_id;
//         const pool = await sql.connect(config);

//         const result = await pool
//             .request()
//             .input("ManagerID", sql.Int, id)
//             .execute("PerformanceCompAcrossQuarters");

//         res.json(result.recordset);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ err });
//     }
// });

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
//         res.status(500).json({err});
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
//         res.status(500).json({err});
//     }

// });

app.put(
  "/owner/UpdatePrice/:NewVal/:ProductID",
  auth_owner,
  async (req, res) => {
    try {
      const { NewVal, ProductID } = req.params;
      const ColumnName = "PricePerUnit";
      const pool = await sql.connect(config);

      const mans = await pool
        .request()
        .input("id", req.user.user_id)
        .query("SELECT * FROM Products WHERE businessID = @id");
      if (mans.recordset.length === 0) throw "Product Not found";
      let flag = false;
      for (let i = 0; !flag && i < mans.recordset.length; i++) {
        if (mans.recordset[i].ProductID === Number(ProductID)) {
          flag = true;
        }
      }
      if (!flag) throw "Product is not included in the business";

      const result = await pool
        .request()
        .input("ColumnName", sql.VarChar, ColumnName)
        .input("NewVal", sql.VarChar, NewVal)
        .input("ProductID", sql.Int, ProductID)
        .execute("UpdateProducts");
      if (result.recordset[0]["RetCode"] === 0)
        result.recordset[0]["message"] = "Successfully updated price";
      else result.recordset[0]["message"] = "Could not update price";
      res.json(result.recordset);
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  }
);

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
//         res.status(500).json({err});
//     }

// });

app.put("/owner/readNotification/:id", auth_owner, async (req, res) => {
  try {
    const { id } = req.params;
    const ColumnName = "ReadStatus";
    const NewVal = 2;
    const pool = await sql.connect(config);
    const all_notes = await pool
      .request()
      .input("id", id)
      .query("SELECT * FROM Notifications WHERE NotificationID = @id");
    if (all_notes.recordset.length === 0)
      throw "There does not exist a notification with the id";
    if (all_notes.recordset[0].RecipientUserID !== req.user.user_id)
      throw "Notification is not for this business";

    const result = await pool
      .request()
      .input("ColumnName", sql.VarChar, ColumnName)
      .input("NewVal", sql.Int, NewVal)
      .input("NotificationId", sql.Int, id)
      .execute("UpdateNotifications");
    if (result.recordset[0]["RetCode"] === 0)
      result.recordset[0]["message"] = "Successfully updated Read Status";
    else result.recordset[0]["message"] = "Could not update read status";

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.put("/manager/sale/:Sid/:Pid/:quantity", auth_man, async (req, res) => {
  try {
    const { Sid, Pid, quantity } = req.params;
    const pool = await sql.connect(config);

    const store = await pool
      .request()
      .input("id", req.user.user_id)
      .query("SELECT * FROM Stores WHERE ManagerID = @id");

    if (store.recordset.length === 0) throw "No stores found";
    if (store.recordset[0].StoreID !== Number(Sid))
      throw "You do not have permission for other stores";

    let b_id = store.recordset[0].BusinessID;
    const prods = await pool
      .request()
      .input("id", b_id)
      .query("SELECT * FROM Products WHERE BusinessID = @id");
    if (prods.recordset.length === 0)
      throw "There are no products registered with the business";

    let flag = false;
    for (let i = 0; !flag && i < prods.recordset.length; i++) {
      if (prods.recordset[i].ProductID === Number(Pid)) {
        flag = true;
      }
    }
    if (!flag) throw "Product is not included in the business";

    const quantity_in_stock = await pool
      .request()
      .input("StoreID", sql.Int, Sid)
      .input("ProductID", sql.Int, Pid)
      .query(
        "SELECT * FROM Inventory WHERE warehouseID = @StoreID AND ProductID = @ProductID"
      );

    if (quantity_in_stock.recordset.length === 0)
      throw "Product is not in stock";

    if (quantity_in_stock.recordset[0].Quantity < quantity)
      throw "Not enough stock";

    const result = await pool
      .request()
      .input("StoreID", sql.Int, Sid)
      .input("ProductID", sql.Int, Pid)
      .input("Quantity", sql.Int, quantity)
      .execute("Sale");
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});
// UpdateManagers
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
const email_req = express.urlencoded({
  extended: false,
  limit: 10000,
  parameterLimit: 1,
});

app.put("/manager/ChangeEmail", email_req, auth_man, async (req, res) => {
  try {
    const ManagerID = req.user.user_id;
    const { NewVal } = req.body;
    const ColumnName = "email";
    if (!isValidEmail(NewVal)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("ColumnName", sql.VarChar, ColumnName)
      .input("NewVal", sql.VarChar, NewVal)
      .input("ManagerID", sql.Int, ManagerID)
      .execute("UpdateManagers");

    if (result.recordset[0]["RetCode"] === 0)
      result.recordset[0]["message"] = "Successfully updated Email";
    else result.recordset[0]["message"] = "Could not update email.";

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

// app.put("/manager/ChangeUserName/:NewVal", auth_man, async(req,res)=>{
//     try{
//         const ManagerID = req.user.user_id;
//         const {NewVal} = req.params;
//         const ColumnName = "username";
//         const pool = await sql.connect(config);

//         const result = await pool
//         .request()
//         .input("ColumnName", sql.VarChar, ColumnName)
//         .input("NewVal", sql.VarChar, NewVal)
//         .input("ManagerID", sql.Int, ManagerID)
//         .execute("UpdateManagers");

//         if (result.rowsAffected && result.rowsAffected[0] > 0) {
//             res.status(200).json({ message: "User Name updated successfully." });
//         } else {
//             res.status(200).json({ message: "User Name not changed(Already the same)" });
//         }

//     } catch (err){
//         res.status(500).json({error: err.message});
//     }
// });

// app.put("/manager/ChangePassword/:NewVal", auth_man, async(req,res)=>{
//     try{
//         const ManagerID = req.user.user_id;
//         const {NewVal} = req.params;
//         const ColumnName = "password";
//         const pool = await sql.connect(config);

//         const result = await pool
//         .request()
//         .input("ColumnName", sql.VarChar, ColumnName)
//         .input("NewVal", sql.VarChar, NewVal)
//         .input("ManagerID", sql.Int, ManagerID)
//         .execute("UpdateManagers");

//         if (result.recordset[0]["RetCode"] === 0)
//             result.recordset[0]["message"] = "Successfully updated Email";
//         else
//             result.recordset[0]["message"] = "Could not update email.";

//         res.json(result.recordset);

//     } catch (err){
//         res.status(500).json({error: err.message});
//     }
// });

//Not allowing buisnessID change from Mangager's view assuming only owner can reallocate managers to another buisness

//UpdateStores

// For all columns except managerID
app.put(
  "/owner/UpdateStores/:Sid/:columnName/:NewVal",
  auth_owner,
  async (req, res) => {
    try {
      const { Sid, columnName, NewVal } = req.params;
      const allowedColumns = ["StoreName", "Address"]; //Define allowed columns
      if (!allowedColumns.includes(columnName)) {
        return res.status(400).json({ error: "Invalid column name." });
      }
      const pool = await sql.connect(config);

      const stores = await pool
        .request()
        .input("id", req.user.user_id)
        .input("Sid", Sid)
        .query(
          "SELECT * FROM Stores WHERE businessID = @id AND StoreID = @Sid"
        );

      if (stores.recordset.length === 0)
        throw "Store Not found in the business";

      const result = await pool
        .request()
        .input("ColumnName", sql.VarChar, columnName)
        .input("NewVal", sql.VarChar, NewVal)
        .input("StoreID", sql.Int, Sid)
        .execute("UpdateStores");

      if (result.recordset[0]["RetCode"] === 0)
        result.recordset[0]["message"] = `Successfully updated ${columnName}`;
      else result.recordset[0]["message"] = `Could not update ${columnName}`;

      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ err });
    }
  }
);

//Update Quantity

app.put("/UpdateQuantity/:SRid/:NewVal", auth_both, async (req, res) => {
  try {
    const { SRid, NewVal } = req.params;
    const columnName = "RequestedQuantity";

    const pool = await sql.connect(config);
    if (req.user.role === "owner") {
      const mans = await pool
        .request()
        .input("OwnerID", req.user.user_id)
        .execute("StockRequestsForOwner");

      if (mans.recordset.length === 0)
        throw "Stock Request not found for the owner";

      let flag = false;
      for (let i = 0; !flag && i < mans.recordset.length; i++) {
        if (mans.recordset[i].RequestID === Number(SRid)) {
          flag = true;
        }
      }
      if (!flag) throw "Stock Request not included in the business";
    } else {
      const store = await pool
        .request()
        .input("ManagerID", req.user.user_id)
        .execute("StoreDetailsOfManagers");

      if (store.recordset.length === 0)
        throw "Manager has not been assigned a store";

      const reqs = await pool
        .request()
        .input("id", store.recordset[0].StoreID)
        .query("SELECT * FROM StockRequests WHERE RequestingStoreID = @id");

      if (reqs.recordset.length === 0) throw "No stock requests for the store";

      let flag = false;
      for (let i = 0; !flag && i < reqs.recordset.length; i++) {
        if (
          reqs.recordset[i].RequestID === Number(SRid) &&
          reqs.recordset[i].ReqStatus === 1
        ) {
          flag = true;
        }
      }
      if (!flag) throw "Stock Request not included in the business";
    }
    const result = await pool
      .request()
      .input("RequestID", SRid)
      .input("ColumnName", sql.VarChar, columnName)
      .input("NewVal", sql.VarChar, NewVal)
      .execute("UpdateStockRequests");

    if (result.recordset[0]["RetCode"] === 0)
      result.recordset[0][
        "message"
      ] = `Successfully updated ${columnName} in Stock Request`;
    else
      result.recordset[0][
        "message"
      ] = `Could not update ${columnName} in Stock Request`;

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.put("/owner/approve_req/:SRid", auth_owner, async (req, res) => {
  try {
    const { SRid } = req.params;
    const pool = await sql.connect(config);
    const mans = await pool
      .request()
      .input("OwnerID", req.user.user_id)
      .execute("StockRequestsForOwner");

    if (mans.recordset.length === 0)
      throw "Stock Request not found for the owner";

    let flag = false;
    for (let i = 0; !flag && i < mans.recordset.length; i++) {
      if (
        mans.recordset[i].RequestID === Number(SRid) &&
        mans.recordset[i].ReqStatus === 1
      ) {
        flag = true;
      }
    }
    if (!flag) throw "Stock Request not included in the business";

    await pool
      .request()
      .input("RequestID", SRid)
      .input("ColumnName", sql.VarChar, "ReqStatus")
      .input("NewVal", sql.VarChar, 2)
      .execute("UpdateStockRequests");

    const result = await pool
      .request()
      .input("RequestID", SRid)
      .input("ColumnName", sql.VarChar, "approvedby")
      .input("NewVal", sql.VarChar, req.user.user_id)
      .execute("UpdateStockRequests");

    if (result.recordset[0]["RetCode"] === 0)
      result.recordset[0]["message"] = `Successfully approved Stock Request`;
    else result.recordset[0]["message"] = `Could not approve Stock Request`;

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.put("/owner/decline_req/:SRid", auth_owner, async (req, res) => {
  try {
    const { SRid } = req.params;

    const pool = await sql.connect(config);
    const mans = await pool
      .request()
      .input("OwnerID", req.user.user_id)
      .execute("StockRequestsForOwner");

    if (mans.recordset.length === 0)
      throw "Stock Request not found for the owner";

    let flag = false;
    for (let i = 0; !flag && i < mans.recordset.length; i++) {
      if (
        mans.recordset[i].RequestID === Number(SRid) &&
        mans.recordset[i].ReqStatus === 1
      ) {
        flag = true;
      }
    }
    if (!flag) throw "Stock Request not included in the business";

    const result = await pool
      .request()
      .input("RequestID", SRid)
      .input("ColumnName", sql.VarChar, "ReqStatus")
      .input("NewVal", sql.VarChar, 3)
      .execute("UpdateStockRequests");

    if (result.recordset[0]["RetCode"] === 0)
      result.recordset[0]["message"] = `Successfully rejected Stock Request`;
    else
      result.recordset[0][
        "message"
      ] = `Could not update the column in Stock Request`;

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.put("/manager/complete_req/:SRid", auth_man, async (req, res) => {
  try {
    const { SRid } = req.params;

    const pool = await sql.connect(config);
    const store = await pool
      .request()
      .input("id", req.user.user_id)
      .query("SELECT * FROM Stores WHERE ManagerID = @id");

    if (store.recordset.length === 0) throw "No stores found";

    const mans = await pool
      .request()
      .input("StoreID", store.recordset[0].StoreID)
      .execute("stockRequestsOfStore");

    if (mans.recordset.length === 0)
      throw "Stock Request not found for the manager";

    let flag = false;
    let num = -1;
    for (let i = 0; !flag && i < mans.recordset.length; i++) {
      if (
        mans.recordset[i].RequestID === Number(SRid) &&
        mans.recordset[i].ReqStatus === 2
      ) {
        flag = true;
        num = i;
      }
    }
    if (!flag) throw "Stock Request not yet approved or is completed";

    await pool
      .request()
      .input("RequestID", SRid)
      .input("ColumnName", sql.VarChar, "ReqStatus")
      .input("NewVal", sql.VarChar, "5")
      .execute("UpdateStockRequests");

    await pool
      .request()
      .input("RequestID", SRid)
      .input(
        "NewVal",
        sql.VarChar,
        new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
        )
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
      )
      .query(
        "UPDATE StockRequests SET fullfillmentdate = @NewVal WHERE RequestID = @RequestID"
      );

    await pool
      .request()
      .input("WarehouseID", sql.VarChar, mans.recordset[num].RequestingStoreID)
      .input("ProductID", sql.VarChar, mans.recordset[num].ProductID)
      .input(
        "stockQuantity",
        sql.VarChar,
        mans.recordset[num].RequestedQuantity
      )
      .execute("insert_ProductinWarehouse");

    res.json({ message: "Successfully added Product to Warehouse." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.put("/owner/sto_manager/:Sid/:Mid", auth_owner, async (req, res) => {
  try {
    const { Sid, Mid } = req.params;
    const pool = await sql.connect(config);
    const mans = await pool
      .request()
      .input("id", req.user.user_id)
      .input("Mid", Mid)
      .query(
        "SELECT * FROM Managers WHERE businessID = @id AND managerID = @Mid"
      );
    if (mans.recordset.length === 0) throw "Manager Not found in the business";

    const stores = await pool
      .request()
      .input("id", req.user.user_id)
      .input("Sid", Sid)
      .query("SELECT * FROM Stores WHERE businessID = @id AND StoreID = @Sid");

    if (stores.recordset.length === 0) throw "Store Not found in the business";

    const result = await pool
      .request()
      .input("ManagerID", sql.Int, Mid)
      .input("StoreId", sql.Int, Sid)
      .execute("update_manager");

    if (result.recordset) res.json(result.recordset);
    else res.json({ message: "Updated Store Manager" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

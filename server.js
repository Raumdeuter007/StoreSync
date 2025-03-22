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
            });
        }
    })
    res.json({message: "It was added successfully"});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

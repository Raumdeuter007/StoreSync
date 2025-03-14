const express = require('express');
require('dotenv').config();
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');
const bodyParser = require('body-parser');

const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};
    Database=${process.env.DB_DATABASE};Trusted_Connection=Yes;`,
};

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended : false}));
app.use(bodyParser.json());

app.get('/', function(req, res){
    sql.connect(config, function(err){
        if (err)
            console.log(err);
        else {
            let request = new sql.Request();
            request.query("SELECT * FROM Roles", (err, record) => {
                if (err)  
                    console.log(err);
                else
                    console.log(record);
            })
        }
    })
    res.end("It worked!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

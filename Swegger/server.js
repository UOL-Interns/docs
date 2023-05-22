const express = require("express");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const app = express();
const corsOptions = {
  origin: "*", // allow to server to accept request from different origin
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
// Swagger config
const SwaggerDocument = require("./swagger.json");

// parse requests of content-type - application/x-www-form-urlencoded
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const db = require("./app/models");
const swagger = require("./swagger");
db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "This is CRM Project Backend" });
});

//  routes

// user Routes
require("./app/routes/user.routes")(app);

// lead routes
require("./app/routes/lead.routes")(app);

// settings routes
require("./app/routes/settings.routes")(app);

// marketing routes
require("./app/routes/marketing.routes")(app);

// email template routes
require("./app/routes/template.routes")(app);

// mastersheet routes
require("./app/routes/mastersheet.routes")(app);
require("./app/routes/scrapper.routes");
// swagger routes
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(SwaggerDocument));

// set port, listen for requests
const PORT = process.env.DEV_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

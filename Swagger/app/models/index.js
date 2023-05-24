const dbConfig = require("../config/db.config.js");
const dotenv = require("dotenv");
dotenv.config();
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  dbConfig.DB, 
  dbConfig.USER, 
  dbConfig.PASSWORD, 
  {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user=require("./user.model.js")(sequelize,Sequelize);
db.lead=require("./lead.model.js")(sequelize,Sequelize);
db.mastersheet=require("./mastersheet.model.js")(sequelize,Sequelize);

// define relationships of lead with user
db.user.hasMany(db.lead, { as: "leads" });
db.lead.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user",
});

// Templates model
db.templates = require("./emailTemplate.model.js")(sequelize, Sequelize);
// define settings model
db.settings = require("./settings.model.js")(sequelize, Sequelize);


module.exports = db;

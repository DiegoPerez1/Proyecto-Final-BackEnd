const knex = require("knex")({
  client: "pg",
  connection: {
    host: "tuffi.db.elephantsql.com",
    port: 5432,
    user: "pugppbtn",
    password: process.env.DB_PASSWORD,
    database: "pugppbtn",
  },
});

module.exports = knex;

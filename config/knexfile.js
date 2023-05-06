const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    port: 5433,
    user: "rodrigo",
    password: process.env.DB_PASSWORD,
    database: "audn",
  },
});

module.exports = knex;

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
/* const cookieParser = require("cookie-parser"); */
const cors = require("cors");
require("dotenv").config();
const agendaRoutes = require("./routes/cancionesRoutes");

//creamos el servidor con express
const app = express();

//middleware    man in the middle
app.use(morgan("dev"));
app.use(bodyParser.json());
/* app.use(cookieParser()); */
app.use(cors());

// colocar rutas
app.use("/api", agendaRoutes);

// levantar el servidor en un puerto
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Servidor levantado en el puerto 3000");
});

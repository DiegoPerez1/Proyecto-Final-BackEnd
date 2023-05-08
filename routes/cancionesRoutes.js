const express = require("express");
const {
  saludo,
  mostrarCanciones,
  mostrarCancionesId,
  registroUsuario,
  loginUsuario,
  // crearPlaylist,
  agregarCancionesDeArtistaAPlaylist,
} = require("../controllers/cancionesController");

const routes = express.Router();

const { runValidation } = require("../middlewares/validators/index");
const { verifyToken } = require("../middlewares/auth/auth");

routes.get("/", saludo);

routes.get("/canciones", runValidation, verifyToken, mostrarCanciones);
routes.get("/canciones/:id", runValidation, verifyToken, mostrarCancionesId);

routes.post("/registro", runValidation, registroUsuario);
routes.post("/login", runValidation, loginUsuario);

/*routes.post("/playlists", runValidation, verifyToken, crearPlaylist);*/
routes.post(
  "/agregar-canciones",
  runValidation,
  verifyToken,
  agregarCancionesDeArtistaAPlaylist
);

module.exports = routes;

const knex = require("../config/knexfile");
const express = require("express");
const {
  saludo,
  mostrarCanciones,
  mostrarCancionesId,
  registroUsuario,
  loginUsuario,
  cupidoMusical,
  artistaNombre,
  listaActividad,
  listasDeReproduccionUsuario,
  agregarArtistaTemporal,
  crearListaReproduccion,
  mostrarArtistas,
} = require("../controllers/cancionesController");

const routes = express.Router();

const { runValidation } = require("../middlewares/validators/index");
const { verifyToken } = require("../middlewares/auth/auth");

routes.get("/", saludo);

routes.get("/canciones", runValidation, verifyToken, mostrarCanciones);
routes.get("/canciones/:id", runValidation, verifyToken, mostrarCancionesId);
routes.get(
  "/artista/:nombreArtista",
  runValidation,
  /* verifyToken, */
  artistaNombre
);

routes.post("/registro", runValidation, registroUsuario);
routes.post("/login", runValidation, loginUsuario);
routes.post("/cupidoMusical",verifyToken, cupidoMusical);

routes.get("/artistas", mostrarArtistas);


routes.post(
  "/actividades/:actividadId/lista-reproduccion",
  runValidation,
  verifyToken,
  listaActividad
); // agrega la ruta listaActividad

routes.get(
  "/usuarios/:usuarioId/listas-reproduccion",

  listasDeReproduccionUsuario
);

routes.post(
  "/temp/artistas",
  runValidation,
  verifyToken,
  agregarArtistaTemporal
);

routes.post("/crear-lista", runValidation, verifyToken, crearListaReproduccion);

module.exports = routes;


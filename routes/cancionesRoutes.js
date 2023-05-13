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
<<<<<<< HEAD
  listasDeReproduccionUsuario,
  agregarArtistaTemporal,
  crearListaReproduccion,
  mostrarArtistas,
=======
>>>>>>> 25cabb9e763789359508d36b1171b9568ab33774
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
<<<<<<< HEAD
routes.post("/cupidoMusical",verifyToken, cupidoMusical);

routes.get("/artistas", mostrarArtistas);
=======
routes.post("/cupidoMusical", verifyToken, cupidoMusical);
>>>>>>> 25cabb9e763789359508d36b1171b9568ab33774


routes.post(
  "/actividades/:actividadId/lista-reproduccion",
  runValidation,
  verifyToken,
  listaActividad
);

routes.get("/api/usuario", (req, res) => {
  const usuarioId = req.session.usuarioId;
  if (usuarioId) {
    const usuario = obtenerUsuarioPorId(usuarioId);
    res.json({ nombre: usuario.nombre });
  } else {
    res.status(401).json({ message: "El usuario no está logueado" });
  }
});

module.exports = routes;


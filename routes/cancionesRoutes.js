const knex = require("../config/knexfile");
const express = require("express");
const {
  saludo,
  mostrarCanciones,
  mostrarCancionesYGenero,
  registroUsuario,
  loginUsuario,
  cupidoMusical,
  artistaNombre,
  obtenerActividades,
  mostrarArtistas,
  cancionesCupido,
  crearListaActividades,
} = require("../controllers/cancionesController");

const routes = express.Router();

const { runValidation } = require("../middlewares/validators/index");
const { verifyToken } = require("../middlewares/auth/auth");

routes.get("/", saludo);

routes.get("/canciones", runValidation, verifyToken, mostrarCanciones);
routes.get("/cancionesGenero", mostrarCancionesYGenero);

routes.get(
  "/artista/:nombreArtista",
  runValidation,
  /* verifyToken, */
  artistaNombre
);

routes.post("/registro", runValidation, registroUsuario);
routes.post("/login", runValidation, loginUsuario);
routes.post("/cupidoMusical", verifyToken, cupidoMusical);
routes.get(
  "/playlist/:playlistId/cancionesCupido",

  cancionesCupido
);
routes.get("/artistas", mostrarArtistas);

routes.get("/usuario", (req, res) => {
  const usuarioId = req.session.usuarioId;
  if (usuarioId) {
    const usuario = obtenerUsuarioPorId(usuarioId);
    res.json({ nombre: usuario.nombre });
  } else {
    res.status(401).json({ message: "El usuario no está logueado" });
  }
});

routes.get("/actividades", obtenerActividades);

routes.get("/generos", async (req, res) => {
  try {
    const actividadId = req.query.actividad_id;
    const generos = await knex("generos")
      .select("genero", "actividad_id")
      .where("actividad_id", actividadId)
      .distinct("genero");
    res.json(generos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los géneros" });
  }
});

routes.get("/prueba", crearListaActividades);

module.exports = routes;

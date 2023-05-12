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
routes.post("/cupidoMusical", verifyToken, cupidoMusical);

routes.get("/artistas", async (req, res) => {
  try {
    const artistas = await knex("artistas").select("nombre");
    res.status(200).json(artistas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

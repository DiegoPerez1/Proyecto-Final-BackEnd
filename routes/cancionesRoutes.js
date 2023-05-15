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
  cancionesCupido,
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
routes.get("/playlist/:playlistId/cancionesCupido",/*  verifyToken, */ cancionesCupido);
routes.get("/artistas", mostrarArtistas);


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

/* try {
  const canciones = await knex("canciones")
    .whereIn("artista", artistas)
    .select("id");

  const playlistNombre = `Cupido Musical de ${usuario_id}`;

  let playlist = await knex("listas_reproduccion")
    .where({ nombre: playlistNombre, usuario_id: usuario_id })
    .select("id")
    .first();

  if (!playlist) {
    const nuevaPlaylist = await knex("listas_reproduccion").insert({
      nombre: playlistNombre,
      usuario_id: usuario_id,
    });
    playlist = nuevaPlaylist[0];
  }

  const cancionesPlaylist = canciones.map((cancion) => ({
    lista_id: playlist.id,
    cancion_id: cancion.id,
  }));

  await knex("canciones_lista").insert(cancionesPlaylist);

  res.status(200).json({
    message: `Canciones de ${artistas.join(
      ", "
    )} agregadas a la lista de reproduccion del usuario ${usuario_id}`,
  });
} catch (error) {
  res.status(400).json({ error: error.message });
}
}; */
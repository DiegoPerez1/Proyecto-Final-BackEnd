const knex = require("../config/knexfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.saludo = async (req, res) => {
  res.status(200);
  res.send("Bienvenidos a nuestro reproductor");
};

exports.mostrarCanciones = async (req, res) => {
  try {
    const resultado = await knex.select("*").from("canciones");
    res.status(200).json({ canciones: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.mostrarCancionesId = async (req, res) => {
  const id = +req.params.id;
  try {
    const resultado = await knex
      .select("*")
      .from("canciones")
      .where({ id: id });
    res.status(200).json({ canciones: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/*exports.crearPlaylist = async (req, res) => {
  const { nombre } = req.body;

  try {
    const playlistId = await knex("playlist").insert({ nombre: nombre });

    // Devolvemos la respuesta con el ID de la nueva playlist
    res.status(200).json({ message: "Playlist creada", playlistId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};*/

exports.cupidoMusical = async (req, res) => {
  const { artistas } = req.body;
  const { usuario_id } = req.params;

  try {
    const canciones = await knex("canciones")
      .join("artistas", "canciones.artista_id", "artistas.id")
      .whereIn("artistas.nombre", artistas)
      .select("canciones.id");

    const playlistNombre = `Playlist Usuario ${usuario_id}`;

    let playlist = await knex("listas_reproduccion")
      .where({ nombre: playlistNombre, usuario_id })
      .select("id")
      .first();

    if (!playlist) {
      const nuevaPlaylist = await knex("listas_reproduccion").insert({
        nombre: playlistNombre,
        usuario_id,
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
};

exports.listaActividad = async (req, res) => {
  const actividadId = req.params.actividadId;

  try {
    const actividad = await knex("actividades")
      .select("genero_principal", "nombre")
      .where({ id: actividadId })
      .first();
    const generoPrincipal = actividad.genero_principal;

    const canciones = await knex("canciones")
      .where({ genero: generoPrincipal })
      .select("id");

    const nombreLista = `${
      actividad.nombre
    } ${new Date().toLocaleDateString()}`;
    const nuevaLista = await knex("listas_reproduccion").insert({
      nombre: nombreLista,
      usuario_id: req.user.id,
    });

    const cancionesPlaylist = canciones.map((cancion) => ({
      lista_id: nuevaLista[0],
      cancion_id: cancion.id,
    }));
    await knex("canciones_lista").insert(cancionesPlaylist);

    res.status(200).json({
      message: `Se ha creado la lista de reproducción de la actividad "${actividad.nombre}" con éxito`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.registroUsuario = async (req, res) => {
  const { usuario, contraseña, email } = req.body;
  const salt = await bcrypt.genSalt(10);
  const passwordEncrypt = await bcrypt.hash(contraseña, salt);
  try {
    const resultado = await knex("usuarios").insert({
      usuario: usuario,
      contraseña: passwordEncrypt,
      email: email,
    });
    res.status(200).json({ message: "Se ha registrado el usuario" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUsuario = async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const resultado = await knex("usuarios")
      .where({ usuario: usuario })
      .first();
    if (!resultado) {
      res.status(404).json({ error: "El usuario no se encuentra registrado" });
      return;
    }

    const validatePassword = await bcrypt.compare(
      contraseña,
      resultado.contraseña
    );

    if (!validatePassword) {
      res.status(400).json({
        error: "Usuario y/o contraseña inválido",
      });
      return;
    }

    const token = jwt.sign(
      {
        usuario: resultado.usuario,
        permisos: resultado.permisos,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" } // Agregamos tiempo de expiración al token
    );

    res.status(200).json({
      message: "El usuario se ha logeado correctamente",
      token: token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.artistaNombre = async (req, res) => {
  const nombreArtista = req.params.nombreArtista.toUpperCase();

  try {
    // Buscar el artista por su nombre
    const canciones = await knex("canciones")
      .whereRaw("artista ILIKE ?", [`%${nombreArtista}%`])
      .select("id", "nombre", "duracion")

    return res.status(200).json(canciones);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

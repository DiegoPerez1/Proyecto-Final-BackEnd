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
exports.mostrarArtistas = async (req, res) => {
  try {
    const artistas = await knex.select("nombre", "imagen").from("artistas");
    res.status(200).json(artistas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.cupidoMusical = async (req, res) => {
  const { artistas } = req.body;
  const usuario_nombre = req.user.usuario;

  const fechaActual = new Date().toLocaleString("es-ES", { hour: "numeric", minute: "numeric" });
  const playlistNombre = `Cupido Musical de ${usuario_nombre} (${fechaActual})`;

  try {
    // Obtener las canciones de los artistas seleccionados
    const canciones = await knex("canciones")
    .whereIn("artista", artistas)
    .select("id");

    // Insertar la nueva playlist y obtener su ID
    const nuevaPlaylistCupido = await knex("listas_reproduccion").insert({
      nombre: playlistNombre,
      usuario_nombre: usuario_nombre,
    }).returning(["id"]);

  // Obtener el ID de la nueva playlist
  const playlistId = nuevaPlaylistCupido[0].id; 

// Crear el arreglo de objetos para insertar en canciones_lista
const cancionesPlaylistCupido = canciones.map((cancion) => ({
  lista_id: playlistId,
  cancion_id: cancion.id,
}));

    // Insertar las canciones en canciones_lista
    await knex("canciones_lista").insert(cancionesPlaylistCupido);

    res.status(200).json({
      message: `Se ha creado la lista de reproducción "Cupido Musical" del usuario: ${usuario_nombre} con éxito`, playlistId: playlistId
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.cancionesCupido = async (req, res) => {
  const playlistId = req.params.playlistId; 
  try {
    const cancionesCupido = await knex("canciones")
      .join("canciones_lista", "canciones_lista.cancion_id", "canciones.id")
      .select("canciones_lista.lista_id", "canciones.id")
      .where("canciones_lista.lista_id", playlistId);

    res.status(200).json({ canciones: cancionesCupido });
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
      .where({ genero_principal: generoPrincipal })
      .select("id");

    const nombreLista = `${
      actividad.nombre
    } ${new Date().toLocaleDateString()}`;

    const usuario = await knex("usuarios")
      .where({ usuario: req.user.usuario })
      .first();

    const nuevaLista = await knex("listas_reproduccion")
      .returning("id")
      .insert({
        nombre: nombreLista,
        usuario: usuario.id,
        actividad: actividadId,
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
      { expiresIn: "1h" }
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
      .select("id", "nombre", "duracion");

    return res.status(200).json(canciones);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listasDeReproduccionUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const listas = await knex("listas_reproduccion")
      .select("id", "nombre")
      .where({ usuario_id: usuarioId });
    console.log(listas);
    res.status(200).json(listas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.agregarArtistaTemporal = async (req, res) => {
  const { artista } = req.body;
  const userId = req.params.userId;

  try {
    let listaTemporal = await knex("lista_temporal")
      .where({ usuario_id: userId })
      .first();
    console.log(`SELECT query: ${listaTemporal.toString()}`);

    if (!listaTemporal) {
      listaTemporal = await knex("lista_temporal").insert({
        usuario_id: userId,
        artistas: [],
      });
      listaTemporal = await knex("lista_temporal")
        .where({ id: listaTemporal[0] })
        .first();
    }

    const canciones = await knex("canciones").where("artista", artista);

    listaTemporal.artistas.push(artista);

    canciones.forEach((cancion) => {
      listaTemporal.canciones.push(cancion.id);
    });

    await knex("lista_temporal").where({ id: listaTemporal.id }).update({
      artistas: listaTemporal.artistas,
      canciones: listaTemporal.canciones,
    });

    res.status(200).json({
      message: "Artista y sus canciones agregados a la lista temporal",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.crearListaReproduccion = async (req, res) => {
  const userId = req.userId;

  try {
    const listaTemporal = await knex("lista_temporal")
      .where({ usuario_id: userId })
      .first();

    if (!listaTemporal || listaTemporal.artistas.length === 0) {
      return res.status(400).json({
        error:
          "No se han seleccionado artistas para crear la lista de reproducción",
      });
    }

    const canciones = await knex("canciones")
      .whereIn("artista", listaTemporal.artistas)
      .select("id");

    const playlistNombre = `Playlist Usuario ${userId}`;
    let playlist = await knex("listas_reproduccion")
      .where({ nombre: playlistNombre, usuario_id: userId })
      .select("id")
      .first();

    if (!playlist) {
      const nuevaPlaylist = await knex("listas_reproduccion").insert({
        nombre: playlistNombre,
        usuario_id: userId,
      });
      playlist = nuevaPlaylist[0];
    }

    const cancionesPlaylist = canciones.map((cancion) => ({
      lista_id: playlist.id,
      cancion_id: cancion.id,
    }));

    await knex("canciones_lista").insert(cancionesPlaylist);

    await knex("lista_temporal").where({ usuario_id: userId }).del();

    res.status(200).json({
      message: `Lista de reproducción creada con éxito para el usuario ${userId}`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

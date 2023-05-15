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

exports.mostrarCancionesYGenero = async (req, res) => {
  try {
    const resultado = await knex
      .select("genero_principal", "actividad_id", "id")
      .from("canciones");

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

  const fechaActual = new Date().toLocaleString("es-ES", {
    hour: "numeric",
    minute: "numeric",
  });
  const playlistNombre = `Cupido Musical de ${usuario_nombre} (${fechaActual})`;

  try {
    // Obtener las canciones de los artistas seleccionados
    const canciones = await knex("canciones")
      .whereIn("artista", artistas)
      .select("id");

    // Insertar la nueva playlist y obtener su ID
    const nuevaPlaylistCupido = await knex("listas_reproduccion")
      .insert({
        nombre: playlistNombre,
        usuario_nombre: usuario_nombre,
      })
      .returning(["id"]);

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
      message: `Se ha creado la lista de reproducción "Cupido Musical" del usuario: ${usuario_nombre} con éxito`,
      playlistId: playlistId,
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
      .select("*")
      .where("canciones_lista.lista_id", playlistId);

    res.status(200).json({ canciones: cancionesCupido });
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

exports.obtenerActividades = async (req, res) => {
  try {
    const actividades = await knex
      .select("id", "nombre", "genero_principal")
      .from("actividades");
    res.json(actividades);
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error al obtener las actividades.");
  }
};

exports.crearListaActividades = async (req, res) => {
  const { genero } = req.body;
  try {
    const canciones = await knex
      .select("genero_principal", "actividad_id", "nombre")
      .from("canciones")
      .where("genero_principal", genero);
    res.json(canciones);
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un error al obtener las actividades.");
  }
};

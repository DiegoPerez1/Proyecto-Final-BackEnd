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

exports.crearPlaylist = async (req, res) => {
  const { nombre } = req.body;

  try {
    // Insertamos la nueva playlist en la base de datos
    const playlistId = await knex("playlist").insert({ nombre: nombre });

    // Devolvemos la respuesta con el ID de la nueva playlist
    res.status(200).json({ message: "Playlist creada", playlistId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.agregarCancionAPlaylist = async (req, res) => {
  const { playlistId, cancionId } = req.params;

  try {
    // Verificar si la playlist y la canción existen en la base de datos
    const playlist = await knex("playlist").where({ id: playlistId }).first();
    const cancion = await knex("canciones").where({ id: cancionId }).first();

    if (!playlist || !cancion) {
      res.status(404).json({ error: "La playlist o la canción no existen" });
      return;
    }

    // Insertar un nuevo registro en la tabla canciones_playlist
    const resultado = await knex("canciones_playlist").insert({
      playlist_id: playlistId,
      cancion_id: cancionId,
    });

    res.status(200).json({ message: "Canción agregada a la playlist" });
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

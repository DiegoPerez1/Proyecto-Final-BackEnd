const knex = require("../../config/knexfile");

exports.validarUsuarioCliente = async (req, res, next) => {
  const { permisos } = req.user;
  try {
    if (permisos === "cliente") {
      next();
    } else {
      res.send({
        message: "El usuario no tiene permisos para acceder al recurso",
      });
    }
  } catch (error) {}
};

exports.validarUsuarioAdmin = async (req, res, next) => {
  const { permisos } = req.user;
  try {
    if (permisos === "admin") {
      next();
    } else {
      res.send({
        message: "El usuario no tiene permisos para acceder al recurso",
      });
    }
  } catch (error) {}
};

exports.validarUsuarioGerente = async (req, res, next) => {
  const { permisos } = req.user;
  try {
    if (permisos === "gerente") {
      next();
    } else {
      res.send({
        message: "El usuario no tiene permisos para acceder al recurso",
      });
    }
  } catch (error) {}
};

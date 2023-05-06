const { check, param } = require("express-validator");

exports.idValidator = [
  param("id")
    .not()
    .isEmpty()
    .withMessage("el id es requerido")
    .isNumeric()
    .withMessage("formato incorrecto de id"),
];

exports.idValidatorBody = [
  check("id")
    .not()
    .isEmpty()
    .withMessage("el id es requerido")
    .isNumeric()
    .withMessage("formato incorrecto de id"),
  check("nombre")
    .not()
    .isEmpty()
    .withMessage("El nombre es requerido")
    .isString()
    .withMessage("formato incorrecto de nombre"),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Contrasenia requerida")
    .isLength({ min: 8 })
    .withMessage("Minimo 8 caracteres para la contrasenia"),
];

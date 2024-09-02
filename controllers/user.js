'use strict'

// Cargar libreria: Validator
var validator = require('validator');
// Cargar libreria: Bcrypt
var bcrypt = require('bcrypt-nodejs');
// Cargar servicio: jwt (token)
var jwt = require('../services/jwt');
// Cargar librerias para trabajar con archivos
var fs = require('fs');
var path = require('path');
// Cargar el modelo de usuarios
var User = require('../models/user');

var controller = {

	// Metodo gusrdar usuarios
	save: function(req, res) {
		// Recoger los parametros de la petición
		var params = req.body;

		// Validar los datos
		try {
			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.name);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);
		} catch(error) {
			return res.status(200).send({
				message: "Error. Algunos datos no se han enviado"
			});
		}
		if (validate_name && validate_surname && validate_email && validate_password) {
			
			// Crear objeto del usuario y asignar valores
			var user = new User();
			user.name = params.name;
			user.surname = params.surname;
			user.email = params.email.toLowerCase();
			user.image = null;
			user.role = 'ROLE_USER';

			// Comprobar si el usuario existe por el email
			User.findOne({ email: user.email }, (err, issetUser) => {
				if(err) { // Error de comprobación
					return res.status(500).send({
						message: "Error al comprobar al comprobar duplicidad de usuario"
					});
				}

				if(!issetUser) { // El usuario no existe
					// Cifrando la contraseña
					bcrypt.hash(params.password, null, null, (err, hash) => {
						user.password = hash;

						// guardando el usuario
						user.save((err, userSaved) => {
							if(err) {
								return res.status(500).send({
									message: "Error al guardar el usuario"
								});
							}

							if(!userSaved) {
								return res.status(500).send({
									message: "El usuario NO  se ha guardado"
								});	
							}

							// Usuario guardado existosamente
							return res.status(200).send({
								status: "success",
								message: "El usuario ha sido gusrdado correctamente",
								user: userSaved
							});
						});
					});
				} else { /// el usuario ya existe
					return res.status(500).send({
						message: "El usuario ya está registrado"
					});
				}
			});

		} else {
			return res.status(200).send({
				message: "Error al validar los datos, intentalo de nuevo"
			});
		}
	},

	// Metodo login de usuarios
	login: function(req, res) {
		// Recogiendo los datos
		var params = req.body;

		// Validar los datos
		try{
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			var validate_password = !validator.isEmpty(params.password);
		} catch (error) {
			return res.status(200).send({
				message: "Error. Algunos datos no se han enviado"
			});
		}

		if(!validate_email || !validate_password) {
			return res.status(200).send({
				message: "Los datos son incorrectos"
			});
		}

		User.findOne({ email: params.email.toLowerCase() }, (err, userFound) => {
			if(err) {
				return res.status(500).send({
					message: "Error al identificar al usuario",
				});
			}

			if(!userFound) {
				return res.status(500).send({
					message: "El usuario no existe",
				});
			}

			// Descifrando la contraseña
			bcrypt.compare(params.password, userFound.password, (err, verified) => {
				if(verified) {

					// Generando Token y enviandolo al usuario
					if(params.getToken) {
						return res.status(200).send({
							token: jwt.createToken(userFound)
						});
					}

					return res.status(200).send({
						status: 'success',
						user: userFound
					});

					// Limpiar el objeto de usuario
					userFound.password = undefined;
				} else {
					return res.status(500).send({
						message: "La contraseña del usuario es incorrecta",
						userFound
					});
				}
			});
		});
	},

	// Metodo de mofificación de datos de usuario (si está logueado)
	update: function(req, res) {
		// recogiendo datos
		var params = req.body;

		// Validar los datos del usuario
		try{
			var validate_name = !validator.isEmpty(params.name);
			var validate_surname = !validator.isEmpty(params.surname);
			var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
		} catch (error) {
			return res.status(200).send({
				message: "Error. Algunos datos no se han enviado"
			});
		}

		// Eliminar propiedades innecesarias para no modificarlas
		delete params.password;

		// Buscar id de usuario y modificar
		var userId = req.user.sub;

		// Validación		
		if(validate_name && validate_surname && validate_email) {

			// Comprobar si el emil existe
			if(req.user.email != params.email) {
				User.findOne({ email: params.email.toLowerCase() }, (err, userFound) => {
					if(err) {
						return res.status(500).send({
							message: "Error al identificar al usuario"
						});
					}

					if(userFound && userFound.email == params.email) {
						return res.status(200).send({
							status: 'error',
							message: "El email enviado pertenece a otro usuario"
						});
					} else {
						//  					condicion   parametros  opciones        callback
						User.findOneAndUpdate({_id: userId}, params, { new: true }, (err, userUpdated) => {
							if(err) {
								return res.status(500).send({
									status: 'success',
									message: "Error al actualizar usuario"
								});
							}

							if(!userUpdated) {
								return res.status(500).send({
									status: 'success',
									message: "El usuario que no ha llegado"
								});
							}

							return res.status(200).send({
								status: 'success',
								message: "El usuario ha sido actualizado",
								user: userUpdated
							});			
						});
					}
				});
			} else {
				//  					condicion   parametros  opciones        callback
				User.findOneAndUpdate({_id: userId}, params, { new: true }, (err, userUpdated) => {
					if(err) {
						return res.status(500).send({
							status: 'success',
							message: "Error al actualizar usuario"
						});
					}

					if(!userUpdated) {
						return res.status(500).send({
							status: 'success',
							message: "El usuario que no ha llegado"
						});
					}

					return res.status(200).send({
						status: 'success',
						message: "El usuario ha sido actualizado",
						user: userUpdated
					});			
				});
			}
		} else {
			return res.status(500).send({
				status: 'error',
				message: 'Algunos datos no son validos'
			})
		}
	},

	// Metodo subir avatar de usuario
	uploadAvatar: function(req, res) {
		var file_name = 'Avatar no subido ...';

		// Comprobar si el fichero me esta llegando
		console.log(req);
		if(!req.file) {
			return res.status(404).send({
				status: 'error',
				message: 'Error. el avatar no se ha subido'
			});
		}

		// Consiguiendo el nombre del archivo y su extension
		var file_path = req.file.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		// Comprobando extensiones de imagen
		if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
			// Eliminar archivo de extension incorrecta
			fs.unlink(file_path, (err) => {
				return res.status(200).send({
					status: 'error',
					message: 'La extensión del archivo no es válida'
				});
			});
		} else {
			// Seleccionar al usuario por id para reemplazar sus datos de imagen
			var user_id = req.user.sub;

			//                         WHEN            VALUES          SHOW NEW       CALLBACK
			User.findOneAndUpdate({_id: user_id}, {image: file_name}, {new: true}, (err, userUpdated) => {
				if(err || !userUpdated) {
					return res.status(500).send({
						status: 'error',
						message: 'Ha ocurrido un error al subir una imagen'
					});
				} else {
					return res.status(200).send({
						status: 'success',
						message: 'El usuario ha actualizado su avatar!',
						userUpdated
					});
				}
			});
		}
	},

	// Obtener un avatar de la BD usando su nombre
	avatar: function(req, res) {
		// Obtener la ruta de la imagen 
		var file_name = req.params.file_name;
		var path_file = './uploads/users/'+file_name;
		// Comprobar si la imagen existe
		fs.exists(path_file, (exists) => {
			if(exists) {
				// Enviar como repuesta la imagen
				return res.sendFile(path.resolve(path_file))
			} else {
				return res.status(404).send({
					message: 'La imagen no existe'
				});
			}
		})
	},

	// Obtener una lista de todos los usuarios
	getUsers: function(req, res) {
		User.find().exec((err,  allUsers) => {
			if(err || !allUsers) {
				return res.status(404).send({
					status: 'error',
					message: 'No hay usuarios para mostrar'
				});
			} else {
				return res.status(200).send({
					status: 'success',
					allUsers
				});
			}
		});
	},

	// Obtener solo un usuario
	getUser: function (req, res) {
		var user_id = req.params.user_id;

		User.findById(user_id).exec((err, oneUser) => {
			if(err || !oneUser) {
				return res.status(404).send({
					status: 'error',
					message: 'No existe el usuario'
				});
			} else {
				return res.status(200).send({
					status: 'success',
					oneUser
				});
			}
		});
	}
	
};

module.exports = controller;
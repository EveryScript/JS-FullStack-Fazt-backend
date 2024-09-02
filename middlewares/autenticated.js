'use-strict'

// Cargar: JWT
var jwt = require('jwt-simple');
// Cargar: moment
var moment = require('moment');
// clave secreta del token
var secret = "secret-key-to-token-123456789";

// Metodo de autenticación
exports.authenticated = function(req, res, next){
	// Comprobar la autorización
	if(!req.headers.authorization){
		return res.status(403).send({
			message: "La peticion no tiene la cabecera de autorización"
		});
	}
	
	// Eliminar las comillas del token (si es que tiene)
	var token = req.headers.authorization.replace(/['"]+/g, '');

	// Decodificando token
	try {
		var payload = jwt.decode(token, secret);
		// Verificando expiración del Token
		if(payload.exp <= moment().unix()){
			return res.status(404).send({
				message: "El Token ha expirado"
			});
		}

	} catch (exception) {
		return res.status(404).send({
			message: "El token es incorrecto",
			token: token
		});
	}

	// Usuario asignado a la request
	req.user = payload;
	// Ejecutar siguiente metoddo (Middleware = en medio)
	console.log("Estas pasando por el middleware");
	next();
}
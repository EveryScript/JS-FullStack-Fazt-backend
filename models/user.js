'use strict'

// Import Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema User
var UserSchema = Schema({
	name: String,
	surname: String,
	email: String,
	password: String,
	image: String,
	role: String
});

// Configuración para evitar enviar la contraseña junto con el objeto de usuario
UserSchema.methods.toJSON = function(){
	var obj = this.toObject();
	delete obj.password;

	return obj;
}

// Export schema
module.exports = mongoose.model('User', UserSchema);
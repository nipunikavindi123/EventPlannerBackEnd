const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const _document_name = "User";

let UserSchema = mongoose.Schema({
    first_name : {
		type : String,
		required : true
    },
    last_name : {
		type : String,
		required : true
    },
	email : {
		type : String,
		required : true,
	},
	avatar : {
		name : {
			type: String,
		},
		url  : {
			type: String,
		}
	},
	phone : {
		type : String,
		required : true,
	},
	amount : {
		type : Number
	},
	address : {
		address1 : {
			type: String,
			required : true
		},
		address2 : {
			type: String,
			required : true
		},
		address3 : {
			type: String,
			required : true
		}
	},
	geolocation : {
		latitude : {
			type: String
		},
		longitude : {
			type: String
		},
	},
	nic : {
		type : String,
		required : true,
	},
	nic_pic : {
		name : {
			type: String,
		},
		url  : {
			type: String,
		}
	},
	password : {
		type : String,
		required : true
	},
	isActive: {
		type: String,
		enum: ['0', '1'],
		default: '1',
	},
	role: {
		type: String,
		enum: ['supplier', 'customer', 'admin'],
		required : true
	},
	supplier_type : {
		type: String,
	},
	refreshToken : {
		type: String
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

UserSchema.pre('save', function (next) {
	var user = this;
	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	})
});

UserSchema.static('findUserByID', function(id) {
	return new Promise((resolve, reject) => {
		mongoose.model(_document_name, UserSchema).findOne({_id : id}).exec(function (err, user){
		    if (err) reject(err)
		    resolve(user);
		});
    });
});

UserSchema.static('findUserByEmail', function(email) {
	return new Promise((resolve, reject) => {
		mongoose.model(_document_name, UserSchema).findOne({email : email}).exec(function (err, user){
		    if (err) reject(err)
		    resolve(user);
		});
    });
});

UserSchema.static('findUserByPhone', function(phone) {
	return new Promise((resolve, reject) => {
		mongoose.model(_document_name, UserSchema).findOne({phone : phone}).exec(function (err, user){
		    if (err) reject(err)
		    resolve(user);
		});
    });
});

module.exports = mongoose.model(_document_name, UserSchema);



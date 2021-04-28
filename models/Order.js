const mongoose = require('mongoose');

const _document_name = "Order";

let OrderSchema = mongoose.Schema({
    supplier_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    customer_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    date: {
		type: String,
		required : true
	},
	time: {
		type: String,
		required : true
	},
	note: {
		type: String
	},
	payment: {
		status : {
		   type: String,
		   enum: ['initial', 'pending', 'confirmed'],
		   default: 'initial',
		},
		details  : {
			transition_id : {
				type: String,
			},
			amount : {
				type: String,
			},
			date : {
				type: String,
			},
			name : {
                type: String,
			},
			email : {
				type: String,
			}
		}
	},
	status: {
		type: String,
		enum: ['pending', 'cancel', 'accept'],
		default: 'pending',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model(_document_name, OrderSchema);
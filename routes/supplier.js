const express = require('express');
const router = express.Router();
const {check} = require('express-validator');

const {authentication_verifier, access_level_verifier} = require('../libraries/authentication.js');
const {languageHelper} = require('../helpers/language.js');
const {User_Model, Grade_Model} = require('../models');
const {SupplierController} = require('../controllers');

router.get('/*',  authentication_verifier, access_level_verifier('supplier'), function(request, response, next){
    next();
});

router.post('/*',  authentication_verifier, access_level_verifier('supplier'), function(request, response, next){
    next();
});

router.put('/*',  authentication_verifier, access_level_verifier('supplier'), function(request, response, next){
    next();
});

router.get('/get_supplier_order_count', SupplierController.get_supplier_order_count);

router.post('/update_request_status', 
[   
    check('status', languageHelper().__("Status Is Required")).not().isEmpty().trim(),
    check('order_id', languageHelper().__("Request Is Required")).not().isEmpty().trim()
], SupplierController.update_request_status);

router.get('/get_supplier_order_details/:order_id', SupplierController.get_supplier_order_details);

module.exports = router;
const express = require('express');
const router = express.Router();
const {check, checkBody} = require('express-validator');
const {CustomerController} = require('../controllers');
const {authentication_verifier, access_level_verifier} = require('../libraries/authentication.js');
const {languageHelper} = require('../helpers/language.js');
const {DT_customer_order_list} = require('../libraries/datatable.js');

router.get('/*',  authentication_verifier, access_level_verifier('customer'), function(request, response, next){
    next();
});

router.post('/*',  authentication_verifier, access_level_verifier('customer'), function(request, response, next){
    next();
});

router.put('/*',  authentication_verifier, access_level_verifier('customer'), function(request, response, next){
    next();
});

router.post('/search_supplier_list', CustomerController.search_supplier_list);

router.get('/get_customer_order_count', CustomerController.get_customer_order_count);

router.post('/populate_dt_customer_order_list', DT_customer_order_list);

router.post('/add_event_request', 
[   
    check('date', languageHelper().__("Date Is Required")).not().isEmpty().trim(),
    check('time', languageHelper().__("Time Is Required")).not().isEmpty().trim(),
    check('supplier_id', languageHelper().__("User Is Required")).not().isEmpty()
], CustomerController.add_event_request);

router.post('/add_payment_details/:order_id', CustomerController.add_payment_details);

router.get('/send_payment_mails/:order_id', CustomerController.send_payment_mails);

module.exports = router;
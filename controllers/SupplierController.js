const fs     = require('fs');
const {validationResult } = require('express-validator');
const mongoose = require('mongoose');

const {User_Model, Order_Model} = require('../models');
const config_app = require("../config/app.js");

const SupplierController = {

    async index(request, response, next){
      return response.status(200).json({
        'code': '200',
        'message': 'SupplierController'
      });
    },

    async get_supplier_order_count(request, response, next){
      const {id} = request.user.user;
      let pending_count = await Order_Model.countDocuments({'supplier_id':id, 'status' : 'pending'});
      let cancel_count  = await Order_Model.countDocuments({'supplier_id':id, 'status' : 'cancel'});
      let accept_count  = await Order_Model.countDocuments({'supplier_id':id, 'status' : 'accept'});
      let request_list  = await Order_Model.find({'supplier_id':id}).populate('customer_id', 'first_name last_name');
      return response.status(200).json({
        type : 'success',
        message:  {
           'pending_count' : (pending_count) ? pending_count : 0,
           'accept_count'  : (accept_count)  ? accept_count : 0,
           'cancel_count'  : (cancel_count)  ? cancel_count : 0,
           'request_list' : request_list
        }
      });

    },

    async update_request_status(request, response, next){
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response.status(422).json({
          type : 'error',
          message:  errors.array()
        });
      }else{
        const {order_id, status, payment_status} = request.body;

        await Order_Model.findByIdAndUpdate(order_id, {
          status  : status, 
          payment : {
            status : payment_status,
          }
        }, {new: true, useFindAndModify : false}, function(error, res){
           if (error){
               response.status(400).json({
                type: "error",
                message : "Something went wrong please try again"
              });
              return;
            }else{
                return response.status(200).json({
                  type: "success",
                  message : "Request has been updated successfuly"
                });
            }

        });
      }
    },

    async get_supplier_order_details(request, response, next){
      const order_id = request.params.order_id;
       const order = await Order_Model.findById(order_id).populate('customer_id',  'first_name last_name avatar');
        if (!order){
          return response.status(400).json({
            type: "error",
            message : "Something went wrong please try again"
          });
        }else{
          return response.status(200).json({
            type: "success",
            message : {
              order : order
            }
          });
        }

    }


    
  
  };
  
  module.exports = SupplierController;
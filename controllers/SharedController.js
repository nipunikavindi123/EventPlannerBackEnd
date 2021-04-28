const fs     = require('fs');
const {validationResult } = require('express-validator');
const bcrypt              = require('bcryptjs');
const mongoose = require('mongoose');

const {User_Model, Order_Model} = require('../models');
const config_app = require("../config/app.js");

const SharedController = {
  

    async attachment_uploader(request, response, next){
      if (!request.file) {
         response.status(400).json({
          type : 'error',
          message: "Something went wrong please try again"
        });
        return
      } else {
        const mimeType = request.file.mimetype;
        const file_name = request.file.originalname;
      }
    },

    async update_user_avatar(request, response, next){
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
          response.status(422).json({
            type : 'error',
            message:  errors.array()
          });
          return
      }else{
        const {name, url} = request.body;
        const {id} = request.user.user;
        await User_Model.findByIdAndUpdate(id, {
          'avatar' : {
            name : name,
            url : url
          }
        }, {new: true, useFindAndModify : false }, function(err, res){
            if(err){
              response.status(400).json({
                type: "error",
                message : "Something went wrong please try again"
              });
              return;
            }else{
              return response.status(200).json({
                type: "success",
                message : "User profile has been updated successfully"
              });
            }
        });
      }

    },

    async get_current_user_details(request, response, next){
       const {id} = request.user.user;
      await User_Model.findById(id, function (error, user){
        if (error){
          return response.status(400).json({
            type: "error",
            message : "Something went wrong please try again"
          });
        }
        return response.status(200).json({
          type: "success",
          message : {
            user : user
          }
        });
      });
    },

    async get_supplier_details(request, response, next){
      const user_id = request.params.user_id;
      await User_Model.findById(user_id, function (error, user){
        if (error){
          return response.status(400).json({
            type: "error",
            message : "Something went wrong please try again"
          });
        }
        return response.status(200).json({
          type: "success",
          message : {
            user : user
          }
        });
      });
    },

    async update_user_profile(request, response, next){
       const errors = validationResult(request);
      if (!errors.isEmpty()) {
          response.status(422).json({
            type : 'error',
            message:  errors.array()
          });
          return
      }else{
        const {first_name, last_name, password, email, phone, address1, address2, address3, role, nic, nic_pic_url, avatar_url, amount, supplier_type, latitude, longitude} = request.body;
        const {id} = request.user.user;

        let Query_builder = {};
        Query_builder.first_name = first_name;
        Query_builder.last_name = last_name;
        Query_builder.email = email;
        Query_builder.phone = phone;
        Query_builder.nic = nic;
        Query_builder.avatar   = {};
        Query_builder.avatar.url = avatar_url;
        Query_builder.nic_pic = {};
        Query_builder.nic_pic.url = nic_pic_url;
        Query_builder.address = {};
        Query_builder.address.address1 = address1;
        Query_builder.address.address2 = address2;
        Query_builder.address.address3 = address3;
        Query_builder.geolocation = {};

        if(amount){
          Query_builder.amount = amount;
        }

        if(supplier_type){
          Query_builder.supplier_type = supplier_type;
        }

        if(password){
          const salt = bcrypt.genSaltSync();
          const hash = bcrypt.hashSync(password, salt);
          Query_builder.password = hash;
        }

        if(latitude){
          Query_builder.geolocation.latitude = latitude;
        }

        if(longitude){
          Query_builder.geolocation.longitude = longitude;
        }
        
        await User_Model.findByIdAndUpdate(id, Query_builder, {new: true, useFindAndModify : false }, function(error, res){
           if (error){
              response.status(400).json({
                type: "error",
                message : "Something went wrong please try again"
              });
              return;
            }else{
              return response.status(200).json({
                type: "success",
                message : "User has been updated successfully"
              });
            }
        });


      }
    },

    async get_customer_order_details(request, response, next){
      const order_id = request.params.order_id;
       const order = await Order_Model.findById(order_id).populate('supplier_id',  'first_name last_name amount avatar').populate('customer_id');
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
  
  module.exports = SharedController;
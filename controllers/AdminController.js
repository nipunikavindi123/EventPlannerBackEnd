const {validationResult } = require('express-validator');
const config_app          = require("../config/app.js");
const bcrypt              = require('bcryptjs');
const fs                  = require('fs');

const {User_Model, Order_Model, Inquiry_Model} = require('../models');

const AdminController = {
  

    async index(request, response, next){
      console.log(request.user);
      return response.status(200).json({
        'code': '200',
        'message': 'Admin controller'
      });
    },

    async get_user(request, response, next){
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

    async delete_user(request, response, next){
      const user_id = request.params.user_id;

      User_Model.findById(user_id).exec(function (error, user) {
        if(user.role == "customer"){
            Order_Model.find({'customer_id' : user_id}).exec(function (error, orders) {
            if(orders){
              orders.forEach( async function(order){
                 await Order_Model.findByIdAndDelete(order._id);
              });
             }
           })
        }
      });

      User_Model.findByIdAndDelete(user_id, function (error){
        if (error){
          return response.status(400).json({
            type: "error",
            message : "Something went wrong please try again"
          });
        }
        return response.status(200).json({
          type: "success",
          message : "User has been deleted successfully"
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
          const {first_name, last_name, password, email, phone, address, role, nic, nic_pic_url, avatar_url, amount, supplier_type} = request.body;
          const id  = request.params.user_id;
   
          let Query_builder = {};
          Query_builder.first_name = first_name;
          Query_builder.last_name = last_name;
          Query_builder.email = email;
          Query_builder.phone = phone;
          Query_builder.address = address;
          Query_builder.nic = nic;
          Query_builder.avatar   = {};
          Query_builder.avatar.url = avatar_url;
          Query_builder.nic_pic = {};
          Query_builder.nic_pic.url = nic_pic_url;

          if(amount){
            Query_builder.amount = amount;
          }

          if(supplier_type != ""){
            Query_builder.supplier_type = supplier_type;
          }

          if(password){
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(password, salt);
            Query_builder.password = hash;
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

    async update_user_status(request, response, next){
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
          return response.status(422).json({
            type : 'error',
            message:  errors.array()
          });
      }else{
        const user_id = request.params.user_id;
        const {status} = request.body;
        let Setstatus = (status == '0')? '1' : '0'; 
        await User_Model.findByIdAndUpdate(user_id, {
          isActive : Setstatus,
        }, {new: true, useFindAndModify : false }, function(error, res){
          if(error){
            response.status(400).json({
              type: "error",
              message : "Something went wrong please try again"
            });
            return;
          }else{
            response.status(200).json({
              type: "success",
              message : "User has been updated successfully"
            });
          }
        });
      }      
    },

    async get_admin_order_count(request, response, next){
      let pending_count = await Order_Model.countDocuments({'status' : 'pending'});
      let cancel_count  = await Order_Model.countDocuments({'status' : 'cancel'});
      let accept_count  = await Order_Model.countDocuments({'status' : 'accept'});
      let order_list    =  await Order_Model.find().populate('customer_id',  'first_name last_name avatar');
      return response.status(200).json({
        type : 'success',
        message:  {
           'pending_count' : (pending_count) ? pending_count : 0,
           'accept_count'  : (accept_count)  ? accept_count : 0,
           'cancel_count'  : (cancel_count)  ? cancel_count : 0,
           'request_list'  : order_list
        }
      });

    },

    async get_admin_users(request, response, next){
      let supplier_count  = await User_Model.countDocuments({'role' : 'supplier'});
      let customer_count  = await User_Model.countDocuments({'role' : 'customer'});
      let admin_count     = await User_Model.countDocuments({'role' : 'admin'});
      let user_list       = await User_Model.find({}, '-password');
      return response.status(200).json({
        type : 'success',
        message:  {
           'supplier_count'  : (supplier_count) ? supplier_count : 0,
           'customer_count'  : (customer_count)  ? customer_count : 0,
           'admin_count'     : (admin_count)  ? admin_count : 0,
           'user_list'       : user_list
        }
      });
    },

    async get_inquiries(request, response, next){
      let inquiry_list  = await Inquiry_Model.find({});
      return response.status(200).json({
        type : 'success',
        message:  {
           'inquiry_list'  : inquiry_list
        }
      });
    },

    async delete_inquiries(request, response, next){
      const inquiry_id = request.params.inquiry_id;
      Inquiry_Model.findByIdAndDelete(inquiry_id, function (error){
        if (error){
          return response.status(400).json({
            type: "error",
            message : "Something went wrong please try again"
          });
        }
        return response.status(200).json({
          type: "success",
          message : "Inquiry has been deleted successfully"
        });
      });

    },

  };
  
  module.exports = AdminController;
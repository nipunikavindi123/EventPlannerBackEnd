const fs     = require('fs');
const {validationResult } = require('express-validator');
const mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail');
const {User_Model, Order_Model} = require('../models');
const config_app = require("../config/app.js");


const CustomerController = {

    async index(request, response, next){
      return response.status(200).json({
        'code': '200',
        'message': 'CustomerController'
      });
    },

    async search_supplier_list(request, response, next){
      const {type} = request.body;
      User_Model.find({role: 'supplier', supplier_type : type}).exec(function(error, events){
        if(error){
          return response.status(400).json({
            type: "error",
            message : "Something went wrong please try again"
          });
        }
        return response.status(200).json({
          type : 'success',
          message:  {
             'events' : events
          }
        });

      });
    },
    
    async add_event_request(request, response, next){
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
          response.status(422).json({
            type : 'error',
            message:  errors.array()
          });
          return
      }else{

        const {date, time, supplier_id, note} = request.body;

        const {id} = request.user.user;

        let Order = new Order_Model({
          'supplier_id': mongoose.Types.ObjectId(supplier_id),
          'customer_id': mongoose.Types.ObjectId(id),
          'date'       : date,
          'time'       : time,
          'note'       : note
        });
        
        Order.save().then(function(event){
          return response.status(200).json({
            type : 'success',
            message:  'Request has been sent successfully'
          });
        });
      }
    },

    async get_customer_order_count(request, response, next){
      const {id} = request.user.user;
      let pending_count = await Order_Model.countDocuments({'customer_id':id, 'status' : 'pending'});
      let cancel_count = await Order_Model.countDocuments({'customer_id':id, 'status' : 'cancel'});
      let accept_count = await Order_Model.countDocuments({'customer_id':id, 'status' : 'accept'});

      return response.status(200).json({
        type : 'success',
        message:  {
           'pending_count' : (pending_count) ? pending_count : 0,
           'accept_count'  : (accept_count)  ? accept_count : 0,
           'cancel_count'  : (cancel_count)  ? cancel_count : 0,
        }
      });

    },

    async add_payment_details(request, response, next){
      const {payment_details} = request.body;
      const order_id = request.params.order_id;

      await Order_Model.findByIdAndUpdate(order_id, { 
          payment : {
            status : 'confirmed',
            details  : {
                  transition_id : payment_details.transition_id,
                  amount : payment_details.amount,
                  date : payment_details.date,
                  name : payment_details.name,
                  email : payment_details.email
                }
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
                  message : "Payment has been added successfuly"
                });
            }
      });
    },

    async send_payment_mails(request, response, next){

      const order_id = request.params.order_id;

      const order_details = await Order_Model.findById(order_id).populate('customer_id').populate('supplier_id');  

      sgMail.setApiKey('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');

      const customerCopy = {
        to: order_details.customer_id.email,
        from: 'eventplanner1507@gmail.com', // Change to your verified sender
        subject: 'Payment receipt ' + order_details.payment.details.transition_id,
        text: 'and easy to do anywhere, even with Node.js',
        html: '<table class="table table-striped">'+
                '<tbody>'+
                  '<tr>'+
                    '<th>Transition ID</th>'+
                    '<td>'+order_details.payment.details.transition_id+'</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<th>Amount</th>'+
                    '<td>'+order_details.payment.details.amount +'</td>'+
                 '</tr>'+
                 '<tr>'+
                    '<th>Date</th>'+
                    '<td>'+order_details.payment.details.date +'</td>'+
                 '</tr>'+
                 '<tr>' +
                    '<th>Name</th>'+
                    '<td>'+order_details.payment.details.name +'</td>'+
                  '</tr>'+
                  '<tr>' +
                    '<th>Email</th>' +
                   '<td>'+order_details.payment.details.email +'</td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>'
      }

      await sgMail.send(customerCopy);

      const supplierCopy = {
        to: order_details.supplier_id.email,
        from: 'eventplanner1507@gmail.com', // Change to your verified sender
        subject: 'Payment receipt ' + order_details.payment.details.transition_id,
        text: 'and easy to do anywhere, even with Node.js',
        html: '<table class="table table-striped">'+
                '<tbody>'+
                  '<tr>'+
                    '<th>Transition ID</th>'+
                    '<td>'+order_details.payment.details.transition_id+'</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<th>Amount</th>'+
                    '<td>'+order_details.payment.details.amount +'</td>'+
                 '</tr>'+
                 '<tr>'+
                    '<th>Date</th>'+
                    '<td>'+order_details.payment.details.date +'</td>'+
                 '</tr>'+
                 '<tr>' +
                    '<th>Name</th>'+
                    '<td>'+order_details.payment.details.name +'</td>'+
                  '</tr>'+
                  '<tr>' +
                    '<th>Email</th>' +
                   '<td>'+order_details.payment.details.email +'</td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>'
      }

      await sgMail.send(supplierCopy);

    }
    
  
  };
  
  module.exports = CustomerController;
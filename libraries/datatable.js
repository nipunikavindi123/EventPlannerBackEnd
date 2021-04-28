const {Order_Model} = require('../models');
const moment = require('../libraries/moment.js');
const debug = require('eyes').inspector({styles: {all: 'cyan'}});


const DT_customer_order_list = function(request, response, next) {
    var params = request.body;
    var order = params.order || [];
    var columns = params.columns || [];
    var type = params.type || "";
    var searchStr = params.search.value;
    const {id} = request.user.user;
    if(params.search.value){
            var regex = new RegExp(params.search.value, "i")
            searchStr = { 
                $or: [
                   {'date': regex }
                ],
                'customer_id' : id 
            };
    }else{
         searchStr = {'customer_id' : id};
    }

    if (order && columns) {
        const sortByOrder = order.reduce((memo, ordr) => {
          const column = columns[ordr.column];
          memo[column.data] = ordr.dir === 'asc' ? 1 :  -1;
          return memo;
        }, {});
  
        if (Object.keys(sortByOrder).length) {
          sort = sortByOrder;
        }
    }


    var recordsTotal = 0;
    var recordsFiltered = 0;

    Order_Model.countDocuments({'customer_id' : id}, function(err, all_count){
        recordsTotal = all_count;
        Order_Model.countDocuments(searchStr, function(err, filterd_count) {
            recordsFiltered = filterd_count;
            Order_Model.find(searchStr, 'date')
            .select("_id supplier_id date time status payment createdAt")
            .skip(Number(params.start))
            .limit(Number(params.length))
            .sort(sort)
            .populate('supplier_id',  'first_name last_name')
            .exec(function(err, results) {
                if (err) {
                    response.status(400).json({
                        message : err
                    });
                    return;
                }
                var data = JSON.stringify({
                    "draw": params.draw,
                    "recordsFiltered": recordsFiltered,
                    "recordsTotal": recordsTotal,
                    "data": results
                });
                response.send(data);
            });

        });

    });
    
}


module.exports = {
    DT_customer_order_list
};
var express = require('express');
var router = express.Router();
require("./../util/util")
var User = require('./../models/user');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', (req, res, next)=>{
  let userName = req.body.userName;
  let userPwd = req.body.userPwd;
  var param = {
    userName: userName,
    userPwd: userPwd
  }
  console.log(param);
  User.findOne(param, (err, doc)=>{
    if(err){
      res.json({
        status: "1",
        msg: err.message
      });
    }else{
      if(doc){
        res.cookie("userId", doc.userId,{
          path:'/',
          maxAge: 1000*60*60
        });
        res.cookie("userName", doc.userName,{
          path:'/',
          maxAge: 1000*60*60
        });
        //req.session.user = doc;
        res.json({
          status: "0",
          msg: '',
          result:{
            userName: doc.userName
          }
        })
      }else{
        console.log(1);
        res.json({
          status: "1",
          msg: 'user/pwd is not correct'
        });
      }
      
    }
  })
});

router.post("/logout",(req, res, next)=>{
  res.cookie("userId", "",{
    path:"/",
    maxAge:-1
  })
  res.json({
    status:"0",
    msg:"",
    result:""
  })
})

router.get("/checkLogin",(req, res, next)=>{
  if(req.cookies.userId){
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName
    });
  }else{
    res.json({
      status:'1',
      msg:'Please Login First',
      result:''
    });
  }
})

//Show CartList
router.get("/cartList", (req, res, next)=>{
  var userId = req.cookies.userId;
  User.findOne({userId: userId}, (err, doc)=>{
    if(err){
      res.json({
        status: '1',
        mes: err.message,
        result:''
      });
    }else{
      if(doc){
        res.json({
          status: '0',
          mes: '',
          result:doc.cartList
        });
      }
    }
  })
})

router.post("/cart/del", (req, res, next)=>{
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  User.update({userId:userId}, {$pull:{'cartList':{'productId':productId}}}, (err, doc)=>{
    if(err){
      res.json({
        status: '1',
        mes: err.message,
        result:''
      });
    }else{
      if(doc){
        res.json({
          status: '0',
          mes: '',
          result:'suc'
        });
      }
    }
  });
})

router.post("/cartEdit", (req, res, next)=>{
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  let productNum = req.body.productNum;
  let checked = req.body.checked;
  User.update({userId: userId, "cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked
  },(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        mes: err.message,
        result:''
      });
    }else{
      if(doc){
        res.json({
          status: '0',
          mes: '',
          result:'suc'
        });
      }
    }
  })
})

router.post("/editCheckAll",(req, res, next)=>{
  let userId = req.cookies.userId;
  let checked = req.body.checked;
  User.findOne({userId: userId}, (err, doc)=>{
    if(err){
      res.json({
        status: '1',
        mes: err.message,
        result:''
      });
    }else{
      if(doc){
        doc.cartList.forEach((item)=>{
          item.checked = checked;
        });
        doc.save((err1, doc1)=>{
          if(err1){
            res.json({
              status: '1',
              mes: err.message,
              result:''
            });
          }else{
            if(doc1){
              res.json({
                status: '0',
                mes: '',
                result:'suc'
              });
            }
          }
        })
      }
    }
  })
});

//search user's address
router.get("/addressList", (req, res, next)=>{
  var userId = req.cookies.userId;
  User.findOne({userId:userId}, (err, doc)=>{
    if(err){
      res.json({
        status: '1',
        mes: err.message,
        result:''
      });
    }else{
      if(doc){
        res.json({
          status: '0',
          mes: '',
          result:doc.addressList
        });
      }
    }
  })
})

//set default address
router.post("/setDefault", (req, res, next)=>{
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  User.findOne({userId: userId}, (err, doc)=>{
    if(err){
      res.json({
        'status': "1",
        'msg': err.message,
        'result': ""
      });
    }else{
      if(doc){
        var addList = doc.addressList;
        addList.forEach((item)=>{
          item.isDefault = false;
          if(item.addressId == addressId){
            item.isDefault = true;
          }
        });
        doc.save((err1, doc1)=>{
          if(err1){
            res.json({
              "status": "1",
              "msg": err.message,
              "result": ""
            });
          }else{
            if(doc1){
              res.json({
                "status": "0",
                "msg":"",
                "result": "suc"
              });
            }
          }
        });
      }
    }
  })
})

//delete address
router.post("/delAddress", (req, res, next)=>{
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  User.update({userId:userId}, {$pull:{addressList:{addressId: addressId}}}, (err, doc)=>{
    if(err){
      res.json({
        "status": "1",
        "msg": err.message,
        "result": ""
      });
    }else{
      if(doc){
        res.json({
          "status": "0",
          "msg":"",
          "result": "suc"
        });
      }
    }
  })
})


router.post("/payment", (req, res, next)=>{
  var userId = req.cookies.userId;
  var orderTotal = req.body.orderTotal;
  var addressId = req.body.addressId;

  User.findOne({userId:userId}, (err, doc)=>{
    if(err){
      res.json({
        "status": "1",
        "msg": err.message,
        "result": ""
      });
    }else{
      if(doc){
        var address = '';
        var goodsList = [];
        doc.addressList.forEach((item)=>{
          if(addressId == item.addressId){
            address = item;
          }
        })

        doc.cartList.filter((item)=>{
          if(item.checked == '1'){
            goodsList.push(item);
          }
        })
        var platform = '622';
        var r1 = Math.floor(Math.random() * 10);
        var r2 = Math.floor(Math.random() * 10);
        var sysDate = new Date().Format('yyyyMMddhhmmss');
        var CreateDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
        var orderId = platform + r1 + sysDate + r2;
        var order = {
          orderId:orderId,
          orderTotal:orderTotal,
          addressInfo: address,
          goodsList: goodsList,
          orderStatus: '1',
          createDate:CreateDate
        }

        doc.orderList.push(order);

        doc.save((err1, doc1)=>{
          if(err1){
            res.json({
              "status": "1",
              "msg": err.message,
              "result": ""
            });
          }else{
            if(doc1){
              res.json({
                "status": "0",
                "msg":"",
                "result": {
                  orderId : order.orderId,
                  orderTotal: orderTotal
                }
              });
            }
          }
        })
        // res.json({
        //   "status": "0",
        //   "msg":"",
        //   "result": {orderId:'', orderTotal:''}
        // });
      }
    }
  })
})

router.get("/orderDetail", (req, res, next)=>{
  let userId = req.cookies.userId;
  let orderId = req.param("orderId");
  console.log(userId);
  console.log(orderId);
  User.findOne({userId: userId}, (err, userInfo)=>{
    if(err){
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      });
    }else{
      if(userInfo){
        let orderList = userInfo.orderList;
        if(orderList.length > 0){
          let orderTotal = 0;
          orderList.forEach((item)=>{
            if(item.orderId == orderId){
              orderTotal = item.orderTotal;
            }
          })
          console.log(orderTotal);
          if(orderTotal > 0){
            res.json({
              status: "0",
              msg: "",
              result: {
                orderId: orderId,
                orderTotal: orderTotal
              }
            });
          }else{
            res.json({
              status: "12002",
              msg: "no order",
              result: ""
            });
          }
          
        }else{
          res.json({
            status: "12001",
            msg: "no order",
            result: ""
          });
        }
      }
      
    }
  })
})
module.exports = router;

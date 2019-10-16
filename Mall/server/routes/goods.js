var express = require("express");
var router = express.Router();

var mongoose = require('mongoose');
var Goods = require('./../models/goods.js');

mongoose.connect('mongodb://127.0.0.1:27017/db_mall');
mongoose.connection.on("connected", ()=>{
    console.log("MongoDB connected success");
});

mongoose.connection.on("error", ()=>{
    console.log("MongoDB connected failed");
});

mongoose.connection.on("disconnnected", ()=>{
    console.log("MongoDB disconnnected");
});

router.get("/", (req, res, next)=>{
    let page = parseInt(req.param("page"));
    let pageSize = parseInt(req.param("pageSize"));
    let sort = req.param("sort");
    let skip = (page - 1) * pageSize;
    let priceLevel = req.param("priceLevel");
    var priceGt = '';
    var priceLt = '';
    var params = {};
    if(priceLevel != 'all'){
        switch(priceLevel){
            case '0': 
                priceGt = 0;
                priceLt = 100;
                break;
            case '1': 
                priceGt = 100;
                priceLt = 500;
                break;
            case '2': 
                priceGt = 500;
                priceLt = 1000;
                break;
            case '3': 
                priceGt = 1000;
                priceLt = 5000;
                break;
        }
        params = {
            salePrice:{
                $gt: priceGt,
                $lte: priceLt
            }
        }
    }
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({'salePrice':sort});
    goodsModel.exec((err, doc)=>{
        if(err){
            res.json({
                status: '1',
                msg: err.message
            });
        }else{
            res.json({
                status: '0',
                msg: '',
                result:{
                    count: doc.length,
                    list:doc
                }
            })
        }
    })
})

router.post("/addCart", (req, res, next)=>{
    let userId = '100000077';
    let productId = req.body.productId;
    
    let User = require("./../models/user");

    User.findOne({userId: userId}, (err, userdoc)=>{
        if(err){
            res.json({
                status: "1",
                msg: err.message
            });
        }else{
            if(userdoc){
                let goodsItem = "";
                userdoc.cartList.forEach((item)=>{
                    if(item.productId == productId){
                        goodsItem = item;
                        item.productNum++;
                    }
                });
                if(goodsItem){
                    userdoc.save((err2, userdoc, numAffected)=>{
                        if(err2){
                            res.json({
                                status: "1",
                                msg: err2.message
                            });
                        }else{
                            res.json({
                                status: "0",
                                msg: '',
                                result: 'num++'
                            });
                        }
                    })
                }else{
                    Goods.findOne({productId:productId}, (err1, doc)=>{
                        if(err1){
                            res.json({
                                status: "1",
                                msg: err1.message
                            });
                        }else{
                            if(doc){
                                doc.productNum = 1;
                                doc.checked = '1';
                                console.log(doc);
                                userdoc.cartList.push(doc);
                                userdoc.save((err2, userdoc, numAffected)=>{
                                    if(err2){
                                        res.json({
                                            status: "1",
                                            msg: err2.message
                                        });
                                    }else{
                                        res.json({
                                            status: "0",
                                            msg: '',
                                            result: 'suc'
                                        });
                                    }
                                })
                            }
                        }
                    });
                }
                

            }
        }
    });
    
})

module.exports = router;
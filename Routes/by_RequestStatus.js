exports.RequestForBuy = function (req, res, app, db) {
    var items = {};
    var sql = `select * from RequestForBuy, Warehouse where Warehouse.warehouseID=RequestForBuy.warehouseID and buyerID='` + req.session['memberID'] + "'";
    let results = db.query(sql);
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            results[step].price = results[step].price * results[step].area;
            items[`item${step}`] = {
                reqID: results[step].reqID,
                reqDate: results[step].reqDate,
                reqType: results[step].reqType,
                warehouseID: results[step].warehouseID,
                buyerID: results[step].buyerID,
                area: results[step].area,
                amounts: results[step].price,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10)
            };
        }
    }
    return JSON.stringify(items);
}

exports.ReqBuyWithAnswer = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var reqType = req.body.reqType;
    var answer = req.body.answer;
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    // const nodePickle = require('pickle');
    connection.connect();
    if (answer === "Cancel") {
        connection.query(`UPDATE RequestForBuy SET reqType='RejByBuyer' WHERE reqID=${reqID}`, function (error, results, fields) {
            if (error) {
                res.send(false);
                connection.end()
            } else {
                res.send(true);
                connection.end();
            }
        });
    } else if (answer === "Confirm") {
        if (reqType === "RejByAd" || reqType === "RejByPv") {
            connection.query(`DELETE FROM RequestForBuy WHERE reqID=${reqID}`, function (error, results, fields) {
                if (error) {
                    res.send(false);
                    connection.end()
                } else {
                    res.send(true);
                    connection.end();
                }
            });
        }
    } else if (answer === "Accept") {
        if (reqType === "ReqPayByBuyer") {
            let price = db.query(`SELECT price FROM Warehouse WHERE warehouseID='${req.body.whID}'`);
            connection.query(`DELETE FROM RequestForBuy WHERE reqID=${reqID}`, function (error, results, fields) {
                if (error) {
                    console.log(error);
                    res.send(false);
                    connection.end();
                } else {
                    var info = {
                        reqID: reqID,
                        memberID: req.session['memberID'],
                        warehouseID: req.body.whID,
                        area: req.body.area
                    };
                    connection.query(`INSERT INTO Buyer SET ?`, info, function (error, results, fields) {
                        if (error) {
                            console.log(error);
                            res.send(false);
                            connection.end()
                        } else {
                            var contract = {
                                reqID: reqID,
                                buyerID: info['memberID'],
                                warehouseID: info['warehouseID'],
                                startDate: req.body.startDate,
                                endDate: req.body.endDate,
                                area: info['area'],
                                price: price[0].price * info['area']  //추후 변경필요, 현재 8로 고정된 가격만 가능. -2020-12-19- 수정완료
                            };
                            connection.query(`INSERT INTO Contract SET ?`, contract, function (error, results, fields) {
                                if (error) {
                                    console.log(error);
                                    res.send(false);
                                    connection.end()
                                }
                                /*
                                else{
                                        var sock = require('../Module/bcsocket').socket;
                                        var dic = {
                                            'MSGTYPE':'RECORD',
                                            'ID':'WEBSERVER',
                                            'data':{
                                                'timestamp':new Date(),
                                                'transaction':`${contract.buyerID} pay ${contract.price} for warehouseID(${contract.warehouseID})`
                                              }
                                        }
                                        nodePickle.dumps(dic,function(pickled){
                                              sock.write(pickled)
                                        })
                                        res.send(true);
                                        connection.end();
                                }
                                */
                                else {
                                    res.send(true);
                                    connection.end();
                                }
                            });
                        }
                    });
                }
            });
        }
    }
}


// exports.GetAmountsForItems = function (req, res, app, db) {
// }

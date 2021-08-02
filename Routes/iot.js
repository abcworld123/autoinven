module.exports = function (app, db) {

    const express = require('express');
    const router = express.Router();

    const iot_monitoring = require('./iot_monitoring');
    const iot_warehousing = require('./iot_warehousing');
    const iot_registerItem = require('./iot_registerItem');
    const iot_editItem = require('./iot_editItem');
    const iot_help = require('./iot_help');

    var check = (req, res, next) => {
        var id = req.session['memberID'];
        var wid = req.session['warehouseID'];
        // var hostIndex = (req.protocol + '://' + req.get('host')).length;
        // var ref = req.headers.referer ? req.headers.referer.toLowerCase().substring(hostIndex) : '';
        // const refererPaths = ['/provider/mywarehouse', '/buyer/usagestatus', '/admin/iottest', '/iot', '/iot/monitoring', '/iot/warehousing', '/iot/help', '/iot/registeritem', '/iot/statistics', '/iot/edititem', '/iot/editsave'];

        if (!id) res.render('Alert/needLogin');
        else if (req.path === '/' && req.method === 'POST') return next();
        else if (!wid) res.render('Alert/cannotAccess');
        // else if (!refererPaths.some((e) => (ref === e || ref === e + '/'))) res.render('Alert/cannotAccess');
        else next();
    };
    router.use(check);

    router.get('/', (req, res, next) => { iot_monitoring.init(req, res, db) });

    router.post('/', (req, res, next) => { iot_monitoring.sessionCheck(req, res, db) });

    router.get('/monitoring', (req, res, next) => { iot_monitoring.init(req, res, db) });

    router.get('/warehousing', (req, res, next) => {
        var itemlist = iot_warehousing.initWarehouse(req, res, db);
        var userType = req.session['type'];
        itemlist = JSON.parse(itemlist);
        res.render('Iot/warehousing', {'itemlist': itemlist, 'userType': userType});
    });

    router.get('/help', (req, res, next) => { iot_help.init(req, res, db) });

    router.get('/randomTest', (req, res, next) => { iot_warehousing.randomTest(req, res, db) });

    router.get('/registerItem', (req, res, next) => { res.render('Iot/registerItem') });

    router.post('/registerItem', (req, res, next) => { iot_registerItem.registerItem(req, res, db) });

    router.get('/editItem', (req, res, next) => {res.render('Iot/editItem') });

    router.post('/editItem', (req, res, next) => {res.render('Iot/editItem', {'rfid': req.body.itemEdit}); });

    router.post('/editSave', (req, res, next) => {iot_editItem.editItem(req, res, db)});

    router.post('/deleteItem', (req, res, next) => {iot_warehousing.delItem(req, res, db) });

    return router;
};

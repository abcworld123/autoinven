exports.edit = function (req, res,app,db) {
    var email = req.body.email;
    var contactNumber = req.body.contactNumber;
    var address = req.body.address;
    var national = req.body.national;
    var SQL = `UPDATE Member SET email=?,contactNumber=?,address=?,national=? WHERE memberID='${req.session.memberID}'`
    var check = db.query(SQL,[email,contactNumber,address,national]);
    if (!check) {
        console.log("error ocurred", error);
        res.redirect('/User/Edit');
    } else {
            req.session['email'] = email;
            req.session['contactNumber'] = contactNumber;
            req.session['address'] = address;
            req.session['national'] = national;
            req.session['CN'] = CN;
            req.session['CA'] = CA;
            req.session['CCN'] = CCN;
            res.redirect('/');    
    }
}
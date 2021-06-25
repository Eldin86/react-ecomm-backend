const admin = require('../firebase')
const User = require('../models/user-model')

exports.authCheck = async (req, res, next) => {
    // if(req.method === 'OPTIONS'){
    //     return next()
    // }
    //console.log(req.headers)
    try{
        //return firebase user after Verify token we get from headers
        const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken)
        //Pass user to next request
        req.user = firebaseUser
        next()
    }catch(e){
        res.status(401).json({
            err: "Invalid or expired token."
        })
    }
}

//Check if user has role of admin
exports.adminCheck = async (req, res, next) => {
    //First is authCheck middleware executes so we have access to req.user from authCheck middleware 
    const {email} = req.user

    //Query database
    const adminUser = await User.findOne({email}).exec()

    if(adminUser.role !== 'admin'){
        res.status(403).json({err: 'Admin resource. Access denied'})
    }else{
        next()
    }
}
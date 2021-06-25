const User = require('../models/user-model')

exports.createOrUpdateUser = async (req, res) => {
  const {name, picture, email} = req.user

  //Find user by email and update name and picture
  //{new: true} returns updated object
  //findOneAndUpdate -> DeprecationWarning
  const user = await User.findOneAndUpdate({email}, {name: email.split("@")[0], picture}, {new: true})

  //If user send user
  if(user){
    console.log('USER UPDATED', user)
    res.json(user)
    return
  }else{
    //Else create new user then return it
    const newUser = await new User({
      email, 
      picture, 
      name: email.split("@")[0]
    }).save()
    console.log('USER CREATED', newUser)
    res.json(newUser)
    return
  }
}

exports.currentUser = async (req, res) => {
  User.findOne({email: req.user.email}).exec((err, user) => {
    //If no user throw error
    if(err) throw new Error(err)
    //Else send user to client
    res.json(user)
  })
}
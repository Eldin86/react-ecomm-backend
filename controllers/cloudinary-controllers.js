const cloudinary = require('cloudinary')

//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.upload = async (req, res) => {
  try{
    let result = await cloudinary.uploader.upload(req.body.image, {
        public_id: `${Date.now()}`,
        resource_type: "auto", // jpeg, png
      });
      res.json({
        public_id: result.public_id,
        url: result.secure_url,
      });
  }catch(e){
      console.log(e)
      res.status(500).send('Error')
  }
};

exports.remove = (req, res) => {
    let image_id = req.body.public_id
    //Cloudinary metoda da uklonimo sliku, metoda kojoj proslijedimo id slike koju zelimo ukloniti
    cloudinary.uploader.destroy(image_id, (err, result) => {
        if(err) return res.json({success: false, err})

        res.status(200).send('Ok')
    })
}
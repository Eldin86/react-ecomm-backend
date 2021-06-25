const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const {readdirSync} = require("fs");
require('dotenv').config()

//**app**
const app = express()

//**db**
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => console.log('DB CONNECTED'))
    .catch(e => console.log(`DB CONNECTION ERROR$ ${e}`))

//**middlewares**
app.use(morgan('dev'))
//Limit user to send max 2MB data size
app.use(express.json({limit: "2mb"}))
app.use(cors())

//**routes middleware**
//Load file synchronously, map over them and require each file inside routes folder
//Have to apply app.use middleware
readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)));

//**port**
const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
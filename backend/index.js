const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "10mb" }))

const PORT = process.env.PORT || 8080
//MONGODB connection
console.log(process.env.MONGODB_URL);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Conect to Database"))
    .catch((err) => console.log(err))

//Schema
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    confirmPassword: String,
    image: String,
})

//Model
const userModel = mongoose.model("user", userSchema)


//API
app.get("/", (req, res) => {
    res.send("Server is running")
})
//SingUp
app.post("/signup", async (req, res) => {
    console.log(req.body);
    const email = req.body.email;

    try {
        const result = await userModel.findOne({ email: email }).exec();

        if (result) {
            res.send({ message: "Email id is already registered", alert: false });
        } else {
            const data = userModel(req.body);
            const save = await data.save();
            res.send({ message: "Successfully signed up", alert: true });
        } //el alert false significa que ese email, ya esta registrado y el alert true significa que estos datos insertados son exitosos.
         //si estos datos insertados son exitosos entonces quieres redirigir al usuario a nuestra pagina de login o de inicio de sesion
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

//Api Login
app.post("/login", async (req, res) => {
    console.log(req.body);
    const email = req.body.email;

    try {
        const result = await userModel.findOne({ email: email });
        if (result) {
            //console.log(result);
            const dataSend = {
                _id: result.id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                image: result.image,
            }
            console.log(dataSend);
            res.send({ message: "Login is successful", alert: true, data: dataSend });
        } else {
            res.send({message: "Email is not aviable, please sign up", alert: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal Server Error", alert: false });
    }
});

//Product section

const schemaProduct = mongoose.Schema({
    name: String,
    category: String,
    image: String,
    price: String,
    description: String
});
const productModel = mongoose.model("product", schemaProduct)

//save product in database (api)
app.post("/uploadProduct", async (req, res) => {
    console.log(req.body);
    const data = await productModel(req.body)
    const datasave = await data.save()
    res.send({message: "Upload successfully"})
})

//
app.get("/product", async (req, res) => {
    const data = await productModel.find({})
    res.send(JSON.stringify(data))
})


//server is running
app.listen(PORT, () => console.log("server is running at port: " + PORT))
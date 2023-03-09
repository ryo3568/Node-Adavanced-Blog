
const express = require("express")
const app = express() 
app.use(express.urlencoded({ extended: true}))
const mongoose = require("mongoose")
const session = require("express-session")

app.set("view engine", "ejs")
app.use("/public", express.static("public"))

// Session
app.use(session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
    cookie:{ maxAge: 300000},
}))

// Connecting to MongoDB
mongoose.connect("mongodb+srv://ryoyanagi0813:a08015379701@cluster0.xarchly.mongodb.net/blogUserDatabase?retryWrites=true&w=majority")
    .then(() => {
        console.log("Success:Connected to MongoDB")
    })
    .catch((error) => {
        console.log("Failure: Unconnected to MongoDB")
    })

// Defining Schema and Model
const Schema = mongoose.Schema 

const BlogSchema = new Schema({
    title:String,
    summary:String,
    image:String,
    textBody:String,
})

const UserSchema = new Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const BlogModel = mongoose.model("Blog", BlogSchema)
const UserModel = mongoose.model("User", UserSchema)

// BLOG function
// Create blog
app.get("/blog/create", (req, res) => {
    if(req.session.userId){
        res.render("blogCreate")
    }
    else{
        res.redirect("/user/login")
    }
})

app.post("/blog/create", (req, res) => {
    BlogModel.create(req.body)
        .then(savedBlogData => {
            res.redirect("/")
        })
        .catch(err => {
            res.render("error", {message: "/blog/createのエラー"})
        })
})

// Read All Blogs 
app.get("/", async(req, res)=>{
    const allBlogs = await BlogModel.find() 
    res.render("index", {allBlogs:allBlogs, session: req.session.userId})
})

// Read Single Blog 
app.get("/blog/:id", async(req, res) => {
    const singleBlog = await BlogModel.findById(req.params.id)
    res.render("blogRead", {singleBlog: singleBlog, session: req.session.userId})
})
// Update Blog
app.get("/blog/update/:id", async(req, res) => {
    const singleBlog = await BlogModel.findById(req.params.id)
    res.render("blogUpdate", {singleBlog})
})

app.post("/blog/update/:id", async(req, res) => {
    await BlogModel.updateOne({ title : "a"}, req.body)
        .catch(error => {
            res.render("error", {message: "/blog/updateのエラー"})
        })
    res.redirect("/")
})
// Delete Blog
app.get("/blog/delete/:id", async(req, res) => {
    const singleBlog = await BlogModel.findById(req.params.id)
    res.render("blogDelete", {singleBlog})
})

app.post("/blog/delete/:id", async(req, res) => {
    await BlogModel.deleteOne({_id: req.params.id})
        .catch(errpr => {
            res.render("error", {message: "/blog/deleteのエラー"})
        })
    res.redirect("/")
})

// User function
// Create user 
app.get("/user/create", (req, res) => {
    res.render("userCreate")
})

app.post("/user/create", (req, res) => {
    UserModel.create(req.body)
        .then(savedUserData => {
            res.redirect("/user/login")
        })
        .catch(error => {
            res.render("error", {message: "/user/createのエラー"})
        })
})

// user Login 
app.get("/user/login", (req, res) => {
    res.render("login")
})

app.post("/user/login", (req, res) => {
    UserModel.findOne({email: req.body.email})
        .then(savedUserData => {
            if(savedUserData){
                if(req.body.password === savedUserData.password){
                    req.session.userId = savedUserData._id
                    res.redirect("/")
                }
                else{
                    res.render("error", {message: "/usre/loginのエラー：パスワードが間違っています"})
                }
            }
            else{
                res.render("error", {message: "/usr/loginのエラー：ユーザーが存在していません"})
            }
        })
})

// Connecting to port
const port = process.env.PORT || 5000

app.listen(port, ()=>{
    console.log(`Listening on ${port}`)
})
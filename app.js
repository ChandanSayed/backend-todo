let express = require("express")
let { MongoClient, ObjectId } = require("mongodb")
const cors = require("cors")
const sanitizeHtml = require("sanitize-html")
const dotenv = require("dotenv")

let db
dotenv.config({ path: "./.env" })
let DB = process.env.DATABASE
let PORT = process.env.PORT || 5000

let connectDb = async () => {
  let client = new MongoClient(DB)
  let connected = await client.connect()
  db = client.db()
  app.listen(PORT)
}
connectDb()

let app = express()
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  db.collection("items").find().toArray((err, items) => {
    res.json(items)
  })
})
app.post("/create-item", (req, res) => {
  if (req.body.item == "") {
    return 0
  }
  let sanitizeBody = sanitizeHtml(req.body.item, { allowedTags: [], allowedAttributes: [] })
  db.collection("items").insertOne({ item: sanitizeBody }, (err, info) => {
    res.json({ _id: info.insertedId, item: sanitizeBody })
  })
})

app.post("/update-item", (req, res) => {
  if (req.body.item == "") {
    return 0
  }
  let sanitizeBody = sanitizeHtml(req.body.item, { allowedTags: [], allowedAttributes: [] })
  db.collection("items").findOneAndUpdate({ _id: new ObjectId(req.body.id) }, { $set: { item: sanitizeBody } }, (err, info) => {
    res.json({ _id: info.value._id, item: sanitizeBody })
  })
})

app.post("/delete-item", (req, res) => {
  db.collection("items").deleteOne({ _id: new ObjectId(req.body.id) }, () => {
    res.send("Delete Successful!")
  })
})

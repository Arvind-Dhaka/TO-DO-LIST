import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.PORT || 3000;

const connectionString = process.env.DATABASE_URL;
const db = new pg.Client({
  connectionString: connectionString,
  ssl: connectionString && (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"))
    ? false
    : { rejectUnauthorized: false }
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM list")
  let items = result.rows;
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO list (title) VALUES ($1)", [item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  await db.query("UPDATE list SET title = $1 WHERE id = $2", [req.body.updatedItemTitle, req.body.updatedItemId])
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  await db.query("DELETE from list WHERE id = $1", [req.body.deleteItemId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

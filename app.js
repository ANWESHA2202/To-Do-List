//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://anwesha_22:1stmongo@cluster0.1nunr.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const eat = new Item({
    name: "Eat"
});
const sleep = new Item({
    name: "Sleep"
});
const code = new Item({
    name: "Code"
});

const defaultItems = [eat, sleep, code];

const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    Item.find({}, function(err, items) {
        if (items.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added all the items!");
                }
            });
            res.redirect("/");
        }
        if (err) {
            console.log(err);
        } else {
            res.render("list", { listTitle: "Today", newListItems: items });
        }
    });
});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(req.body.checkbox, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully removed!");
            }
            res.redirect("/");
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }


});

app.get("/:customlist", function(req, res) {
    const listName = _.capitalize(req.params.customlist);

    List.findOne({ name: listName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + listName);
            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });

});

app.get("/about", function(req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}


app.listen(port, function() {
    console.log("Server started successfully");
});
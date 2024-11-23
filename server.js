// server.js

/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Alejandra Pereira Student ID: 139273221 Date: 11-22-2024
*
*  Cyclic Web App URL: https://web322-appa4.glitch.me
* 
*  GitHub Repository URL: https://github.com/AlejandraPereira/web322-app.git
*
********************************************************************************/ 


const express = require('express'); // Import the express module
const path = require('path'); // Import path module for handling file paths
const app = express(); // Create an Express application
const storeService = require('./store-service'); //  Import store service module
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')
const upload = multer(); // no { storage: storage } since we are not using disk storage
const exphbs = require('express-handlebars');  // import express-handlebars module
const PORT = process.env.PORT || 8080;  // Set the server to listen on the specified port

// Set Handlebars as the view engine
app.set('view engine', 'hbs');

//middleware function to add the property activeRoute to app.locals
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

//to set up Handlebars and specify the file extension as .hbs
app.engine('hbs', exphbs.engine({
    extname :'hbs',
    defaultLayout: 'main',
    helpers: {  //the helper will automatically render the correct <li> element add the class "active" if app.locals.activeRoute matches the provided url
        navLink: function (url, options) {
            return (
                '<li class="nav-item"><a ' +
                (url == app.locals.activeRoute ? 'class="nav-link active"' : 'class="nav-link"') +
                ' href="' +
                url +
                '">' +
                options.fn(this) +
                '</a></li>'
            );
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

//cloudiary configuration
cloudinary.config({
    cloud_name: 'dgntvs2g1',
    api_key: '583661694435134',
    api_secret: 'EAVDJ_vaim2ruq6LDbiOU32_6IU',
    secure: true,
});
// Route for the root URL '
app.get('/', (req, res) => {
    res.redirect('/shop'); // Redirect to the shop route
});

// Route for the '/about' URL that serves the about.html file
app.get('/about', (req, res) => {
    res.render('about'); // Render the about view using Handlebars
});

// Route to serve the addItem file
app.get('/items/add', (req, res) => {
    res.render('addItem');
});
// Route for shop
const itemData = require("./store-service");
app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
  
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await storeService.getPublishedItems();
      }
  
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  });

// Route for shop by ID
    app.get('/shop/:id', async (req, res) => {

        // Declare an object to store properties for the view
        let viewData = {};
    
        try{
    
            // declare empty array to hold "item" objects
            let items = [];
    
            // if there's a "category" query, filter the returned items by category
            if(req.query.category){
                // Obtain the published "items" by category
                items = await itemData.getPublishedItemsByCategory(req.query.category);
            }else{
                // Obtain the published "items"
                items = await itemData.getPublishedItems();
            }
    
            // sort the published items by itemDate
            items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));
    
            // store the "items" and "item" data in the viewData object (to be passed to the view)
            viewData.items = items;
    
        }catch(err){
            viewData.message = "no results";
        }
    
        try{
            // Obtain the item by "id"
            viewData.item = await itemData.getItemById(req.params.id);
        }catch(err){
            viewData.message = "no results"; 
        }
    
        try{
            // Obtain the full list of "categories"
            let categories = await itemData.getCategories();
    
            // store the "categories" data in the viewData object (to be passed to the view)
            viewData.categories = categories;
        }catch(err){
            viewData.categoriesMessage = "no results"
        }
    
        // render the "shop" view with all of the data (viewData)
        res.render("shop", {data: viewData})
    });

    app.get('/items', (req, res) => {
        const category = req.query.category;
        const minDate = req.query.minDate;
    
        if (category) {
            // Filter by category
            storeService.getItemsByCategory(category)
                .then(data => {
                    if (data.length > 0) {
                        res.render("items", { items: data }); // Render items view with filtered data
                    } else {
                        res.render("post", { message: "No results" }); // Render view with no results message
                    }
                })
                .catch(error => {
                    console.error("Error retrieving items by category:", error);
                    res.render("post", { message: "No results" }); // Render view with error message
                });
        } else if (minDate) {
            // Filter by minDate
            storeService.getItemsByMinDate(minDate)
                .then(data => {
                    if (data.length > 0) {
                        res.render("items", { items: data }); // Render items view with filtered data
                    } else {
                        res.render("post", { message: "No results" }); // Render view with no results message
                    }
                })
                .catch(error => {
                    console.error("Error retrieving items by minDate:", error);
                    res.render("post", { message: "No results" }); // Render view with error message
                });
        } else {
            // Return all items
            storeService.getAllItems()
                .then(data => {
                    if (data.length > 0) {
                        res.render("items", { items: data }); // Render items view with all data
                    } else {
                        res.render("post", { message: "No results" }); // Render view with no results message
                    }
                })
                .catch(error => {
                    console.error("Error retrieving items:", error);
                    res.render("post", { message: "No results" }); // Render view with error message
                });
        }
    });
    


// Route for categories
app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then(data => {
       res.render("categories", { categories: data });  // Render the "categories" view and pass the retrieved categories data
    })
    .catch(error => {
        res.render("categories", { message: "No results" });  // Render the view with an error message
    });
});

//accesing the functions 
storeService.initialize()
    .then(({ items, categories }) => {
        console.log("Initialization successful");
        //if our call to the initialize() method is successful
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(error => {
        console.log("Initialization failed: ", error);
      
    });

//postitems/add
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
        const newItem = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            featureImage: req.body.featureImage,
            published: req.body.published
        };
        storeService.addItem(newItem)
            .then((addedItem) => {
                res.redirect("/items"); //Redirect to /items after adding
            })
            .catch((error) => {
                console.error("Error adding item:", error);
                res.status(500).send("Could not add item");
            });
        
    } 
});

// Route for Item/:value
app.get('/item/:value',(req,res)=>{
    const itemId = req.params.value; // Extracts the item ID from the URL parameters
    storeService.getItemById(itemId)
    .then( item=>{
        res.json(item);  //Send items data as a JSON response
    })
    .catch(error =>{
        console.log("No Item Found!", error); //error if the item is not found
        res.status(404).json({ error: "Item not found" }); // // Sends a 404 response to the user if the item is not found
    });
});

// Route for error404
app.use((req, res) => { // no matching routes
    res.sendFile(path.join(__dirname, 'views', 'error404.jpg')); // Custom 404 message
});

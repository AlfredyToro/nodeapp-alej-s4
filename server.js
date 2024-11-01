// server.js
const express = require('express'); // Import the express module
const path = require('path'); // Import path module for handling file paths
const app = express(); // Create an Express application

const storeService = require('./store-service'); //  Import store service module

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')
const upload = multer(); // no { storage: storage } since we are not using disk storage

cloudinary.config({
    cloud_name: 'dgntvs2g1',
    api_key: '583661694435134',
    api_secret: 'EAVDJ_vaim2ruq6LDbiOU32_6IU',
    secure: true,
});

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


// Route for the root URL that redirects to '/about'
app.get('/', (req, res) => {
    res.redirect('/about'); // Redirect to the about route
});

// Route for the '/about' URL that serves the about.html file
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html')); // Send the about.html file
});

// Route to serve the addItem.html file
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html')); // Send the addItem.html file
});


// Route for shop
app.get('/shop', (req, res) => {
   
    storeService.getPublishedItems()
    .then(data => {
        res.json(data); // Send published items data as a JSON response
        // res.send(data);
    })
    .catch(error => {
        console.log("Error retrieving published items:", error);  //??
    });

});


// Route for items  filtering by category or minDate
app.get('/items', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;

    if (category) {
        // Filter by category
        storeService.getItemsByCategory(category)
            .then(data => {
                res.json(data); // Send items by category as JSON
            })
            .catch(error => {
                console.error("Error retrieving items by category:", error);
                res.status(500).send("Could not retrieve items by category");
            });
    } else if (minDate) {
        // Filter by minDate
        storeService.getItemsByMinDate(minDate)
            .then(data => {
                res.json(data); // Send items by minDate as JSON
            })
            .catch(error => {
                console.error("Error retrieving items by minDate:", error);
                res.status(500).send("Could not retrieve items by minDate");
            });
    } else {
        // return all items
        storeService.getAllItems()
            .then(data => {
                res.json(data); // Send all items as JSON
            })
            .catch(error => {
                console.error("Error retrieving items:", error);
                res.status(500).send("Could not retrieve items");
            });
    }
});


// Route for categories
app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then(data => {
        res.json(data); // Send items data as a JSON response
       
    })
    .catch(error => {
        console.log("Error retrieving categories", error);
    });
});

// Route for error404
app.use((req, res) => { // no matching routes
    res.sendFile(path.join(__dirname, 'views', 'error404.jpg')); // Custom 404 message
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


// Set the server to listen on the specified port
const PORT = process.env.PORT || 8080;


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


    

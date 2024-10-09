
/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Alejandra Pereira Leon
Student ID: 139273221
Date: 10/09/2024
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: https://github.com/AlejandraPereira/web322-app.git
********************************************************************************/

// server.js
const express = require('express'); // Import the express module
const path = require('path'); // Import path module for handling file paths
const app = express(); // Create an Express application

const storeService = require('./store-service'); //  Import store service module

// Route for the root URL that redirects to '/about'
app.get('/', (req, res) => {
    res.redirect('/about'); // Redirect to the about route
});

// Route for the '/about' URL that serves the about.html file
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html')); // Send the about.html file
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

// Route for items
app.get('/items', (req, res) => {
    storeService.getAllItems()
    .then(data => {
        res.json(data); // Send items data as a JSON response
       
    })
    .catch(error => {
        console.log("Error retrieving items:", error);
    });
});

// Route for categories
app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then(data => {
        res.json(data); // Send items data as a JSON response
       
    })
    .catch(error => {
        console.log("Error retrieving categories:", error);
    });
});

// Route for error404
app.use((req, res) => { // no matching routes
    res.sendFile(path.join(__dirname, 'views', 'error404.jpg')); // Custom 404 message
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


    

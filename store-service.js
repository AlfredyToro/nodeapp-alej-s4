const fs = require("fs");

const items = [];
const categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        // Read the items.json file
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                return reject("unable to read items file"); // Handle the error
            }
            // Parse the file content and assign it to items
            try {
                items.push(...JSON.parse(data)); // Convert to object
            } catch (parseError) {
                return reject("unable to parse items data"); // Handle parsing errors
            }
            // Read the categories.json file
            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                if (err) {
                    return reject("unable to read categories file"); // Handle the error
                }
                // Parse the file content and assign it to categories
                try {
                    categories.push(...JSON.parse(data)); // Convert to object
                } catch (parseError) {
                    return reject("unable to parse categories data"); // Handle parsing errors
                }
                // Both operations have completed successfully
                resolve({ items, categories }); // Resolve the promise with the parsed data
            });
        });
    });
}

function getAllItems(){
    return new Promise((resolve,reject) =>{
        if(items.length == 0){ // If the length of the array is 0
            return reject("No results returned"); // call reject 
        }
        resolve(items);
    });
}

function getPublishedItems(){
    return new Promise((resolve,reject)=>{
        const publishedItems = items.filter(item => item.published); // Filter the items only those that are published
        if(items.length == 0){ // If the length of the array is 0
            return reject("No results returned"); // call reject
        }
        resolve(items);
    });
}

function getCategories(){
    return new Promise((resolve,reject)=>{
        if (!categories || categories.length === 0) { // Check if categories is defined and has elements
            return reject("No results returned"); // call reject
        }
        resolve(categories);
    });
}

module.exports = {
    initialize, 
    getAllItems,
    getPublishedItems,
    getCategories
};
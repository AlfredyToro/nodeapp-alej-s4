const { rejects } = require("assert");
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
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};

function addItem(itemData){
    return new Promise((resolve, reject)=>{

        if (itemData.published === undefined) { //check if the itemData is undefined
            itemData.published = false;  //false = undefined
        } else {
            itemData.published = true; // true if is defined
        }
        itemData.id = itemData.length+1; // set the id to the length of the items array plus 1
        items.push(itemData); //add the itemData  to the array
        resolve(itemData); //resolve the promise

    });
}

function getItemsByCategory(category){
    return new Promise((resolve,reject)=>{

        // find items that match the specified category
        const matchingItems = items.filter(item => item.category === parseInt(category, 10));

        // Check if any matching items were found
        if (matchingItems.length === 0) {
            reject("No results returned"); // If no matching items were found, reject the promise
        } else {
            resolve(matchingItems);   // If matching items were found, resolve the promise
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        // find items whose postDate is greater than or equal to minDateStr
        const matchingItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        // Check if any matching items were found
        if (matchingItems.length === 0) {
            reject("No results returned"); // If no matching items were found, reject the promise
        } else {
            resolve(matchingItems);   // If matching items were found, resolve the promise
        }
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        // Find the item with the matching id
        const foundItem = items.find(item => item.id === id);
        if (foundItem) { // Check if an item was found
            resolve(foundItem); // resolve the promise 
        } else {
            reject("No result returned"); // reject the promis
        }
    });
}

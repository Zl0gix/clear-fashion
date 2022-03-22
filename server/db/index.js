require('dotenv').config();
const {MongoClient, ServerApiVersion} = require('mongodb');
const fs = require('fs');

const MONGODB_DB_NAME = 'clearfashion';
const MONGODB_COLLECTION = 'products';
const MONGODB_URI = process.env.MONGODB_URI;

let client = null;
let database = null;

/**
 * Get db connection
 * @type {MongoClient}
 */
const getDB = module.exports.getDB = async () => {
  try {
    if (database) {
      console.log('💽  Already Connected');
      return database;
    }

    client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true, "useUnifiedTopology": true, "serverApi": ServerApiVersion.v1});
    database = client.db(MONGODB_DB_NAME);

    console.log('💽  Connected');

    return database;
  } catch (error) {
    console.error('🚨 MongoClient.connect...', error);
    return null;
  }
};

/**
 * Insert list of products
 * @param  {Array}  products
 * @return {Object}
 */
module.exports.insert = async products => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.insertMany(products, {'ordered': false});

    return result;
  } catch (error) {
    console.error('🚨 collection.insertMany...', error);
    fs.writeFileSync('products.json', JSON.stringify(products));
    return {
      'insertedCount': error.result.nInserted
    };
  }
};

/**
 * Find products based on query
 * @param  {Array}  query
 * @return {Array}
 */
module.exports.find = async (query, options) => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find(query, options);
    return result.toArray();
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

/**
 * Aggregate products based on query
 * @param  {Array}  query
 * @return {Array}
 */
 module.exports.aggregate = async query => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.aggregate(query).toArray();
    return result;
  } catch (error) {
    console.error('🚨 collection.aggregate...', error);
    return null;
  }
};

/**
 * Aggregate products based on query
 * @param  {Array} products
 * @return {Array}
 */
 module.exports.upsert = async (products) => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    let count = 0;

    const upsertPromises = products.map(async product => {
      console.log(product);
      let result = await collection.updateOne({ '_id': product._id}, { "$set" : product}, {'upsert': true});
      return result.modifiedCount;
    });
    
    await Promise.all(upsertPromises).then(modifiedCounts => {
      count = modifiedCounts.reduce((a, b) => a+b, 0);
    });
    console.log(`Updated ${count} document(s)`);
    return count;
  } catch (error) {
    console.error('🚨 collection.upsert...', error);
    return null;
  }
};

/**
 * Close the connection
 */
module.exports.close = async () => {
  try {
    await client.close();
  } catch (error) {
    console.error('🚨 MongoClient.close...', error);
  }
};

import { ChromaClient } from "chromadb";
const client = new ChromaClient();

// switch `createCollection` to `getOrCreateCollection` to avoid creating a new collection every time
const collection = await client.getOrCreateCollection({
  name: "my_collection",
});

// // switch `addRecords` to `upsertRecords` to avoid adding the same documents every time
// await collection.upsert({
//   documents: [
//     "Mario's favorite mushroom is truffle! Cuz it tastes good on spaghetti!",
//   ],
//   ids: ["mario-favorite-mushroom"],
// });

// const results = await collection.query({
//   queryTexts: ["What is Mario's favorite mushroom?"], // Chroma will embed this for you
//   nResults: 2, // how many results to return
// });

// console.log(results);
import { ChromaClient } from "chromadb";

const client = new ChromaClient();

export async function queryChromaCollection(question: string, collectionName: string = "my_collection", nResults: number = 3) {
  try {
    const collection = await client.getCollection({
      name: collectionName,
    });

    const results = await collection.query({
      queryTexts: [question],
      nResults: nResults,
    });

    return results;
  } catch (error) {
    console.error("ChromaDB query error:", error);
    // Return empty results instead of throwing to allow graceful fallback
    return { documents: [[]], distances: [[]] };
  }
}

export async function getOrCreateCollection(collectionName: string = "my_collection") {
  try {
    const collection = await client.getOrCreateCollection({
      name: collectionName,
    });
    return collection;
  } catch (error) {
    console.error("ChromaDB collection error:", error);
    throw error;
  }
}

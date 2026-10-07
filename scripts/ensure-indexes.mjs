import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required.");

await mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
});

const db = mongoose.connection.db;

async function ensureIndex(
    collectionName,
    key,
    options = {},
) {
    const collections = await db
        .listCollections(
            { name: collectionName },
            { nameOnly: true },
        )
        .toArray();

    if (collections.length === 0) {
        console.log(
            `Skipping ${collectionName}: collection does not exist.`,
        );

        return;
    }

    const collection =
        db.collection(collectionName);

    const indexes =
        await collection.indexes();

    const existing = indexes.find(
        (index) => {
            const existingKey =
                JSON.stringify(index.key);

            const requestedKey =
                JSON.stringify(key);

            return (
                existingKey === requestedKey
            );
        },
    );

    if (existing) {
        console.log(
            `Index already exists: ${collectionName}.${existing.name}`,
        );

        return;
    }

    await collection.createIndex(
        key,
        options,
    );

    console.log(
        `Created index on ${collectionName}:`,
        key,
    );
}

await ensureIndex("products",
    { status: 1, createdAt: -1, _id: -1 },
    { name: "catalog_status_createdAt_id" },
);
await ensureIndex("products",
    { categorySlug: 1, status: 1, createdAt: -1, _id: -1 },
    { name: "catalog_category_status_createdAt_id" },
);
await ensureIndex("categories",
    { title: 1 },
    { name: "categories_title" },
);
await ensureIndex("sessions",
    { tokenHash: 1 },
    { name: "sessions_tokenHash", unique: true },
);
await ensureIndex("sessions",
    { expiresAt: 1 },
    { name: "sessions_expiresAt_ttl", expireAfterSeconds: 0 },
);
await ensureIndex("authchallenges",
    { expiresAt: 1 },
    { name: "authchallenges_expiresAt_ttl", expireAfterSeconds: 0 },
);
await ensureIndex("reviews",
    { createdAt: -1 },
    { name: "reviews_createdAt" },
);

// Normalize legacy products once so future catalogue queries can use the
// indexed active status and normal timestamp ordering. This does not touch
// seed.mjs and is safe to run against the existing database.
await db.collection("products").updateMany(
    { status: { $exists: false } },
    { $set: { status: "active" } },
);
await db.collection("products").updateMany(
    { status: null },
    { $set: { status: "active" } },
);
await db.collection("products").updateMany(
    { createdAt: { $exists: false } },
    [
        { $set: { createdAt: { $toDate: "$_id" } } },
    ],
);

console.log("LMP database indexes created and legacy product fields normalized.");
await mongoose.disconnect();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import "dotenv/config";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is required. Make sure .env.local is loaded.");
}

const userSchema = new mongoose.Schema({
  username: String,
  displayName: String,
  email: String,
  passwordHash: String,
  role: String,
  trustLevel: Number,
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  slug: String,
  title: String,
  description: String,
  image: String,
  productCount: Number,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  legacyId: String,
  name: String,
  slug: String,
  categorySlug: String,
  description: String,
  price: Number,
  currency: String,
  image: String,
  deals: Number,
  vendorName: String,
  vendorLevel: Number,
  verified: Boolean,
  location: String,
  details: [String],
  status: String,
}, { timestamps: true });

productSchema.index({ categorySlug: 1, status: 1 });
productSchema.index({ name: "text", description: "text" });

const User = mongoose.models.SeedUser || mongoose.model("SeedUser", userSchema, "users");
const Category = mongoose.models.SeedCategory || mongoose.model("SeedCategory", categorySchema, "categories");
const Product = mongoose.models.SeedProduct || mongoose.model("SeedProduct", productSchema, "products");

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function numberFrom(value, field, productName) {
  const match = value.match(/\d+(?:\.\d+)?/);
  if (!match) throw new Error(`Invalid ${field} for product "${productName}": ${value || "missing value"}`);
  return Number(match[0]);
}

function titleCase(value) {
  return value.trim().toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseProductBlock(block) {
  const fields = new Map();
  const content = block.replace(/^\s*\d+\.\s*/, "");
  const pattern = /^\s*([A-Za-z]+)\s*:-\s*(.*?)\s*$/gm;

  for (const match of content.matchAll(pattern)) {
    fields.set(match[1].toUpperCase(), match[2].trim());
  }

  const name = fields.get("NAME");
  const category = fields.get("CATEGORY");
  const image = fields.get("IMAGE");
  const details = fields.get("DETAILS");
  const price = fields.get("PRICE");

  if (!name || !category || !image || !details || !price) {
    throw new Error(`A product in data.txt is missing NAME, CATEGORY, IMAGE, DETAILS, or PRICE. Block: ${content.slice(0, 160)}`);
  }

  return {
    name: name.trim(),
    category: category.trim(),
    image,
    details,
    price: numberFrom(price, "PRICE", name),
    currency: (fields.get("CURRENCY") || "EUR").trim().toUpperCase(),
    location: titleCase(fields.get("LOCATION") || "Unspecified"),
  };
}

async function parseSeedData() {
  const source = await readFile(new URL("../data.txt", import.meta.url), "utf8");
  const [categoryPart, productPart] = source.split(/^\s*PRODUCTS\s*$/im);

  if (!productPart) throw new Error("data.txt must contain a PRODUCTS heading.");

  const categories = [...categoryPart.matchAll(/^\s*\d+\.\s*(.+?)\s*$/gm)]
    .map((match) => match[1].trim())
    .filter((title) => title.toUpperCase() !== "CATEGORIES")
    .map((title) => ({ title, slug: slugify(title) }));

  if (!categories.length) throw new Error("data.txt must define at least one category under CATEGORIES.");

  const productBlocks = productPart
    .trim()
    .split(/\n(?=\s*\d+\.\s*NAME\s*:-)/i)
    // Windows CRLF blank lines can become their own split entries. Only
    // parse entries that actually start a numbered product record.
    .filter((block) => /^\s*\d+\.\s*NAME\s*:-/im.test(block));
  const products = productBlocks.map(parseProductBlock);

  if (!products.length) throw new Error("data.txt must define at least one product under PRODUCTS.");

  const categoryByName = new Map(categories.map((category) => [category.title.toUpperCase(), category]));
  for (const product of products) {
    if (!categoryByName.has(product.category.toUpperCase())) {
      throw new Error(`Product "${product.name}" references unknown category "${product.category}".`);
    }
  }

  return { categories, products, categoryByName };
}

const { categories: categorySeeds, products: productSeeds, categoryByName } = await parseSeedData();

console.log("Connecting to MongoDB...");
await mongoose.connect(uri);
console.log(`MongoDB connected to: ${mongoose.connection.db.databaseName}`);

console.log("Removing existing collections...");
const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
for (const collection of collections) {
  try {
    await mongoose.connection.db.dropCollection(collection.name);
    console.log(`Dropped collection: ${collection.name}`);
  } catch {
    await mongoose.connection.db.collection(collection.name).deleteMany({});
    console.log(`Cleared collection: ${collection.name}`);
  }
}

console.log("Creating the database from data.txt...");
const passwordHash = await bcrypt.hash("DemoPass123!", 12);
await User.create({
  username: "demo_user",
  displayName: "Demo User",
  email: "demo@example.com",
  passwordHash,
  role: "user",
  trustLevel: 1,
});

const categoryImageBySlug = new Map();
for (const product of productSeeds) {
  const category = categoryByName.get(product.category.toUpperCase());
  if (category && !categoryImageBySlug.has(category.slug)) categoryImageBySlug.set(category.slug, product.image);
}

const insertedCategories = await Category.insertMany(categorySeeds.map((category) => ({
  ...category,
  description: `Products listed under ${category.title}.`,
  image: categoryImageBySlug.get(category.slug) || "",
  productCount: productSeeds.filter((product) => product.category.toUpperCase() === category.title.toUpperCase()).length,
})));

const insertedProducts = await Product.insertMany(productSeeds.map((product, index) => {
  const category = categoryByName.get(product.category.toUpperCase());
  const slug = `${slugify(product.name)}-${String(index + 1).padStart(2, "0")}`;

  return {
    legacyId: slug,
    slug,
    name: product.name,
    categorySlug: category.slug,
    description: product.details,
    price: product.price,
    currency: product.currency,
    image: product.image,
    deals: 0,
    vendorName: "LMP",
    vendorLevel: 1,
    verified: true,
    location: product.location,
    details: [product.details],
    status: "active",
  };
}));

console.log("==========================================");
console.log("DATABASE SEED COMPLETE");
console.log("==========================================");
console.log(`Categories:    ${insertedCategories.length}`);
console.log(`Products:      ${insertedProducts.length}`);
console.log("Notifications: 0 (not seeded)");
console.log("Demo login: demo_user / DemoPass123!");

await mongoose.disconnect();
console.log("MongoDB connection closed.");

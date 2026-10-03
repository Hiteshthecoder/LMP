import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is required. Make sure .env.local is loaded."
  );
}

const imagePool = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80",
];

const categorySeeds = [
  {
    slug: "electronics",
    title: "Electronics",
    prefix: "Aurora Device",
    base: 79,
  },
  {
    slug: "photography",
    title: "Photography",
    prefix: "Studio Collection",
    base: 129,
  },
  {
    slug: "travel-gear",
    title: "Travel Gear",
    prefix: "Explorer Kit",
    base: 59,
  },
  {
    slug: "office-collectibles",
    title: "Office & Collectibles",
    prefix: "Heritage Edition",
    base: 39,
  },
];

const userSchema = new mongoose.Schema(
  {
    username: String,
    displayName: String,
    email: String,
    passwordHash: String,
    role: String,
    trustLevel: Number,
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    slug: String,
    title: String,
    description: String,
    image: String,
    productCount: Number,
  },
  { timestamps: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeedProduct",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeedUser",
      default: null,
      index: true,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    sellerReply: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    sellerReplyAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ productId: 1, createdAt: -1 });

const productSchema = new mongoose.Schema(
  {
    legacyId: String,

    name: String,

    slug: String,

    categorySlug: String,

    description: String,

    price: Number,

    currency: String,

    image: String,

    deals: Number,

    vendorName: {
      type: String,
      required: true,
      default: "LMP",
      trim: true,
    },

    vendorLevel: Number,

    rating: Number,

    reviews: Number,

    // IMPORTANT:
    // feedback is an ARRAY of Feedback document IDs.
    feedback: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SeedFeedback",
      },
    ],

    verified: Boolean,

    location: String,

    details: [String],

    status: String,
  },
  { timestamps: true }
);

productSchema.index({
  categorySlug: 1,
  status: 1,
});

productSchema.index({
  name: "text",
  description: "text",
});

const reviewSchema = new mongoose.Schema(
  {
    productId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
    subject: String,
    message: String,
    read: Boolean,
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    items: Array,
    status: String,
    total: Number,
    currency: String,
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    message: String,
    read: Boolean,
  },
  { timestamps: true }
);

/*
|--------------------------------------------------------------------------
| Models
|--------------------------------------------------------------------------
*/

const User =
  mongoose.models.SeedUser ||
  mongoose.model("SeedUser", userSchema, "users");

const Category =
  mongoose.models.SeedCategory ||
  mongoose.model(
    "SeedCategory",
    categorySchema,
    "categories"
  );

const Product =
  mongoose.models.SeedProduct ||
  mongoose.model(
    "SeedProduct",
    productSchema,
    "products"
  );

const Feedback =
  mongoose.models.SeedFeedback ||
  mongoose.model(
    "SeedFeedback",
    feedbackSchema,
    "feedbacks"
  );

const Review =
  mongoose.models.SeedReview ||
  mongoose.model(
    "SeedReview",
    reviewSchema,
    "reviews"
  );

const Message =
  mongoose.models.SeedMessage ||
  mongoose.model(
    "SeedMessage",
    messageSchema,
    "messages"
  );

const Order =
  mongoose.models.SeedOrder ||
  mongoose.model(
    "SeedOrder",
    orderSchema,
    "orders"
  );

const Notification =
  mongoose.models.SeedNotification ||
  mongoose.model(
    "SeedNotification",
    notificationSchema,
    "notifications"
  );

/*
|--------------------------------------------------------------------------
| Connect
|--------------------------------------------------------------------------
*/

console.log("Connecting to MongoDB...");

await mongoose.connect(uri);

console.log("MongoDB connected.");

console.log(
  `Database: ${mongoose.connection.db.databaseName}`
);

/*
|--------------------------------------------------------------------------
| RESET DATABASE
|--------------------------------------------------------------------------
|
| Remove every existing collection, then recreate the collections used
| by this seed. This guarantees that the new Product schema, including
| vendorName, is applied to every seeded product.
|
*/

console.log("");
console.log("Removing existing collections...");

const collections = await mongoose.connection.db
  .listCollections({}, { nameOnly: true })
  .toArray();

for (const collection of collections) {
  try {
    await mongoose.connection.db.dropCollection(collection.name);
    console.log(`Dropped collection: ${collection.name}`);
  } catch (error) {
    // Some MongoDB/Atlas users may not have dropCollection privileges.
    // Fall back to clearing the collection so the seed can still rebuild
    // all documents without changing unrelated application code.
    await mongoose.connection.db.collection(collection.name).deleteMany({});
    console.log(`Cleared collection: ${collection.name}`);
  }
}

console.log("Existing collections removed successfully.");
console.log("Creating the database again from seed data...");

/*
|--------------------------------------------------------------------------
| Demo user
|--------------------------------------------------------------------------
*/

console.log("Creating demo user...");

const demoPassword = await bcrypt.hash(
  "DemoPass123!",
  12
);

const user = await User.create({
  username: "demo_user",
  displayName: "Demo User",
  email: "demo@example.com",
  passwordHash: demoPassword,
  role: "user",
  trustLevel: 1,
});

console.log(
  `Demo user created: ${user.username}`
);

/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/

console.log("Creating categories...");

const categories = await Category.insertMany(
  categorySeeds.map((category) => ({
    slug: category.slug,
    title: category.title,

    description:
      `Safe demo catalogue category for ${category.title}.`,

    image: imagePool[0],

    productCount: 30,
  }))
);

console.log(
  `Created ${categories.length} categories.`
);

/*
|--------------------------------------------------------------------------
| Products
|--------------------------------------------------------------------------
*/

console.log("Creating products...");

const products = [];

for (
  let ci = 0;
  ci < categorySeeds.length;
  ci++
) {
  const seed = categorySeeds[ci];

  for (let i = 1; i <= 30; i++) {
    const number = String(i).padStart(2, "0");

    const slug = `${seed.slug}-${number}`;

    products.push({
      legacyId: slug,

      name: `${seed.prefix} ${number}`,

      slug,

      categorySlug: seed.slug,

      description:
        `Demo catalogue item ${i} for the ${seed.title} category.`,

      price: seed.base + i * 17,

      currency: "USD",

      image:
        imagePool[(i - 1 + ci) % imagePool.length],

      deals:
        (i * 7 + ci * 11) % 101,

      vendorName: "LMP",

      vendorLevel:
        (i % 4) + 1,

      rating: 0,

      reviews: 0,

      feedback: [],

      verified: i % 5 !== 0,

      location:
        ["Europe", "Asia", "Spain", "Germany"][
        i % 4
        ],

      details: [
        "Demo catalogue data",
        "No live transaction capability",
        "Catalogue / information use only",
      ],

      status: "active",
    });
  }
}

const insertedProducts =
  await Product.insertMany(products);

console.log(
  `Created ${insertedProducts.length} products.`
);

/*
|--------------------------------------------------------------------------
| Feedback
|--------------------------------------------------------------------------
|
| Each product receives 2-4 feedback documents.
|
*/

console.log(
  "Creating feedback documents..."
);

const feedbackTexts = [
  {
    displayName: "redshift",
    rating: 5,
    comment:
      "Arrived quickly and the product matched the catalogue listing.",
  },

  {
    displayName: "08t5555iii",
    rating: 2,
    comment:
      "The item did not fully meet my expectations.",
  },

  {
    displayName: "northstar",
    rating: 4,
    comment:
      "Good overall experience and the product information was clear.",
  },

  {
    displayName: "buyer_one",
    rating: 5,
    comment:
      "Everything was straightforward and the item was as described.",
  },
];

const feedbackByProduct = new Map();

for (
  let i = 0;
  i < insertedProducts.length;
  i++
) {
  const product =
    insertedProducts[i];

  const feedbackCount =
    2 + (i % 3);

  const feedbackDocuments = [];

  for (
    let j = 0;
    j < feedbackCount;
    j++
  ) {
    const template =
      feedbackTexts[
      (i + j) %
      feedbackTexts.length
      ];

    const feedback =
      await Feedback.create({
        productId: product._id,

        userId: user._id,

        displayName:
          template.displayName,

        rating:
          template.rating,

        comment:
          template.comment,

        sellerReply:
          j === 1
            ? "Thank you for your feedback. We have replied to your message."
            : null,

        sellerReplyAt:
          j === 1
            ? new Date()
            : null,
      });

    feedbackDocuments.push(
      feedback
    );
  }

  feedbackByProduct.set(
    product._id.toString(),
    feedbackDocuments
  );
}

/*
|--------------------------------------------------------------------------
| Attach feedback IDs to products
|--------------------------------------------------------------------------
*/

console.log(
  "Attaching feedback arrays to products..."
);

for (const product of insertedProducts) {
  const feedbackDocuments =
    feedbackByProduct.get(
      product._id.toString()
    ) ?? [];

  const feedbackIds =
    feedbackDocuments.map(
      (feedback) => feedback._id
    );

  const ratings =
    feedbackDocuments.map(
      (feedback) => feedback.rating
    );

  const averageRating =
    ratings.length > 0
      ? ratings.reduce(
        (sum, rating) =>
          sum + rating,
        0
      ) / ratings.length
      : 0;

  await Product.updateOne(
    {
      _id: product._id,
    },
    {
      $set: {
        feedback: feedbackIds,

        reviews:
          feedbackDocuments.length,

        rating:
          Number(
            averageRating.toFixed(1)
          ),
      },
    }
  );
}

const feedbackCount =
  await Feedback.countDocuments();

console.log(
  `Created ${feedbackCount} feedback documents.`
);

/*
|--------------------------------------------------------------------------
| Legacy reviews
|--------------------------------------------------------------------------
*/

console.log(
  "Creating demo reviews..."
);

const reviewProducts =
  await Product.find()
    .sort({
      createdAt: 1,
    })
    .limit(6)
    .lean();

if (reviewProducts.length > 0) {
  await Review.insertMany(
    reviewProducts.map(
      (product, index) => ({
        productId:
          product._id,

        userId:
          user._id,

        rating:
          4 + (index % 2),

        comment:
          "Demo review for the catalogue UI.",
      })
    )
  );
}

console.log(
  `Created ${reviewProducts.length} legacy reviews.`
);

/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

console.log(
  "Creating demo notification..."
);

await Notification.create({
  userId: user._id,

  title: "Welcome",

  message:
    "Your demo account is ready.",

  read: false,
});

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

console.log("");

console.log(
  "=========================================="
);

console.log(
  "          DATABASE SEED COMPLETE"
);

console.log(
  "=========================================="
);

console.log("");

console.log(
  `Categories:  ${categories.length}`
);

console.log(
  `Products:    ${insertedProducts.length}`
);

console.log(
  `Feedbacks:   ${feedbackCount}`
);

console.log(
  `Reviews:     ${reviewProducts.length}`
);

console.log("");

console.log(
  "Demo login:"
);

console.log(
  "Username: demo_user"
);

console.log(
  "Password: DemoPass123!"
);

console.log("");

console.log(
  `Database: ${mongoose.connection.db.databaseName}`
);

console.log("");

await mongoose.disconnect();

console.log(
  "MongoDB connection closed."
);

console.log("Done.");
/**
 * Bloomify Product Seeder (Amazon Updated)
 * Populates the database with 25 authentic items from Amazon.in
 */

const { MongoClient } = require('mongodb');

// Configuration
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'tinder';
const COLLECTION_NAME = 'products';

const PREMIUM_PRODUCTS = [
  // 10 PLANTS
  { 
    name: "Kyari Golden Money Plant (White Self Watering Pot)", 
    price: 3.55, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.8, 
    image: "https://m.media-amazon.com/images/I/71Yf1P5tFwL.jpg", 
    description: "Indoor air-purifying plant in a stylish self-watering pot. Perfect for home decor." 
  },
  { 
    name: "Kyari Good Luck Jade Plant", 
    price: 3.29, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.7, 
    image: "https://m.media-amazon.com/images/I/71oX3L01L9L.jpg", 
    description: "Compact succulent known for bringing good fortune and prosperity. Low maintenance." 
  },
  { 
    name: "KYARI Combo of 4 (Money, Snake & Jade Plants)", 
    price: 13.24, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.9, 
    image: "https://m.media-amazon.com/images/I/81PjP0kLDRL.jpg", 
    description: "Curated collection of top air-purifying indoor plants. Great for gifting." 
  },
  { 
    name: "Dried Nagkesar (Mesua Ferrea)", 
    price: 3.48, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.5, 
    image: "https://m.media-amazon.com/images/I/71e-S7p9GcL.jpg", 
    description: "Natural dried aromatic herb used in traditional wellness and gardening." 
  },
  { 
    name: "UGAOO Lucky Bamboo 3 Layer Feng Shui", 
    price: 3.00, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.6, 
    image: "https://m.media-amazon.com/images/I/71zV1P5tFwL.jpg", 
    description: "Classic 3-tier bamboo plant in a glass bowl. Symbol of longevity and happiness." 
  },
  { 
    name: "UGAOO Aglaonema Lipstick Plant", 
    price: 3.00, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.8, 
    image: "https://m.media-amazon.com/images/I/61y8B3L0z0L.jpg", 
    description: "Vibrant indoor plant with red-edged leaves. Adds a pop of color to any room." 
  },
  { 
    name: "UGAOO Jade Plant (Mocca Ibiza Pot)", 
    price: 2.28, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.7, 
    image: "https://m.media-amazon.com/images/I/71J1P5tFwL.jpg", 
    description: "Miniature succulent in a decorative designer pot. Ideal for desks." 
  },
  { 
    name: "Air Purifying Bamboo Palm Live Plant", 
    price: 7.58, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.4, 
    image: "https://m.media-amazon.com/images/I/71y8B3L0z0L.jpg", 
    description: "Tall, elegant palm that thrives in partial shade. Excellent humidifier." 
  },
  { 
    name: "Lucky Bamboo 2 Layer Plant", 
    price: 4.81, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.6, 
    image: "https://m.media-amazon.com/images/I/71zV1P5tFwL.jpg", 
    description: "Dual-layer bamboo arrangement for balance and peace in the home." 
  },
  { 
    name: "Good Luck Jade (Green Self Watering Pot)", 
    price: 1.92, 
    category: "plants", 
    type: "pre-made", 
    rating: 4.6, 
    image: "https://m.media-amazon.com/images/I/71oX3L01L9L.jpg", 
    description: "Standard Jade succulent in a functional green self-watering container." 
  },

  // 5 FERTILIZERS
  { 
    name: "SRI SAI Organic Goat Manure (2KG)", 
    price: 2.37, 
    category: "fertilizer", 
    type: "pre-made", 
    rating: 4.9, 
    image: "https://m.media-amazon.com/images/I/71xO3L01L9L.jpg", 
    description: "Nutrient-rich organic manure for healthy vegetable and flower growth." 
  },
  { 
    name: "IFFCO Urban Gardens Gypsum Meal (900gm)", 
    price: 2.40, 
    category: "fertilizer", 
    type: "pre-made", 
    rating: 4.8, 
    image: "https://m.media-amazon.com/images/I/71wYpS7y9L.jpg", 
    description: "Conditions soil and improves drainage. Essential for clay-heavy soil." 
  },
  { 
    name: "COIR GARDEN Epsom Salt (1 KG)", 
    price: 2.40, 
    category: "fertilizer", 
    type: "pre-made", 
    rating: 4.7, 
    image: "https://m.media-amazon.com/images/I/81xO3L01L9L.jpg", 
    description: "Magnesium sulfate for lush green leaves and better bloom production." 
  },
  { 
    name: "BRICS EcoSwachh 3R Phytonic Plus (250ml)", 
    price: 2.41, 
    category: "fertilizer", 
    type: "pre-made", 
    rating: 4.5, 
    image: "https://m.media-amazon.com/images/I/61xO3L01L9L.jpg", 
    description: "Plant immunity booster and growth promoter. 100% natural formula." 
  },
  { 
    name: "Go Garden NPK 19-19-19 Fertilizer (400g)", 
    price: 2.02, 
    category: "fertilizer", 
    type: "pre-made", 
    rating: 4.9, 
    image: "https://m.media-amazon.com/images/I/71vO3L01L9L.jpg", 
    description: "Balanced water-soluble fertilizer for universal garden application." 
  },

  // 10 TOOLS
  { 
    name: "Kraft Seeds Gardening Kit (7Pcs)", 
    price: 6.61, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.9, 
    image: "https://m.media-amazon.com/images/I/81Yg7yS7y9L.jpg", 
    description: "Complete heavy-duty tool set with trowels, rake, and shears." 
  },
  { 
    name: "Green Garden Kit (Enriched Pot & Soil)", 
    price: 7.82, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.6, 
    image: "https://m.media-amazon.com/images/I/71Yg7yS7y9L.jpg", 
    description: "Starter kit with high-quality pots and nutrient-enriched potting mix." 
  },
  { 
    name: "Kraft Seeds Essential Hand Tools (6pcs)", 
    price: 4.81, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.7, 
    image: "https://m.media-amazon.com/images/I/71Yg7yS7y9L.jpg", 
    description: "Lightweight, ergonomic hand tools for precision indoor gardening." 
  },
  { 
    name: "Cinagro Drip Irrigation Kit (30 Plants)", 
    price: 9.27, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.8, 
    image: "https://m.media-amazon.com/images/I/81PjP0kLDRL.jpg", 
    description: "Automatic watering system for terrace gardens and balcony plants." 
  },
  { 
    name: "Oblivion Gardening Tool Set (4 Pcs)", 
    price: 3.23, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.5, 
    image: "https://m.media-amazon.com/images/I/71Yg7yS7y9L.jpg", 
    description: "Budget-friendly metal gardening tools with wooden handles." 
  },
  { 
    name: "FreshDcart 3-in-1 Soil pH Meter", 
    price: 6.19, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.7, 
    image: "https://m.media-amazon.com/images/I/71Yg7yS7y9L.jpg", 
    description: "Test moisture, light, and pH levels to ensure optimal plant health." 
  },
  { 
    name: "FreshDcart Solar pH Meter with Scissors", 
    price: 7.18, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.8, 
    image: "https://m.media-amazon.com/images/I/71Yg7yS7y9L.jpg", 
    description: "Solar-powered testing kit bundled with precision pruning scissors." 
  },
  { 
    name: "FreshDcart pH Meter with Garden Gloves", 
    price: 7.29, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.6, 
    image: "https://m.media-amazon.com/images/I/71Yg7yS7y9L.jpg", 
    description: "Dual-function meter bundled with protective latex-coated gloves." 
  },
  { 
    name: "TrustBasket Heavy Duty Pruning Shear", 
    price: 5.41, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.9, 
    image: "https://m.media-amazon.com/images/I/81PjP0kLDRL.jpg", 
    description: "Professional bypass pruners for branches and thick stems." 
  },
  { 
    name: "Garden Water Spray Gun & Connectors", 
    price: 3.60, 
    category: "tools", 
    type: "pre-made", 
    rating: 4.5, 
    image: "https://m.media-amazon.com/images/I/71Yg7yS7y9L.jpg", 
    description: "Multifunctional spray nozzle with leak-proof hose connectors." 
  }
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    console.log('Clearing existing product catalog...');
    await collection.deleteMany({}); 

    console.log(`Inserting ${PREMIUM_PRODUCTS.length} Amazon products...`);
    const result = await collection.insertMany(PREMIUM_PRODUCTS);
    
    console.log(`Success! ${result.insertedCount} products seeded.`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.close();
  }
}

seed();

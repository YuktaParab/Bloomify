const ecommerce = require('./ecommerce.js');

async function runSeed() {
  console.log("Seeding Database with new Professional Products...");
  await ecommerce.initializeProducts();
  console.log("Done!");
  process.exit(0);
}

runSeed();

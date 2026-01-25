const fs = require('fs');
const path = require('path');
const { db } = require('./firebase-config');

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Migrate bus drivers
    const busDriversFile = path.join(__dirname, 'busDrivers.json');
    if (fs.existsSync(busDriversFile)) {
      const busDrivers = JSON.parse(fs.readFileSync(busDriversFile));
      console.log(`Migrating ${busDrivers.length} bus drivers...`);

      for (const driver of busDrivers) {
        await db.collection('busDrivers').doc(driver.id).set(driver);
      }
      console.log('Bus drivers migrated successfully.');
    } else {
      console.log('No busDrivers.json file found.');
    }

    // Migrate buses
    const busesFile = path.join(__dirname, 'buses.json');
    if (fs.existsSync(busesFile)) {
      const buses = JSON.parse(fs.readFileSync(busesFile));
      console.log(`Migrating ${buses.length} buses...`);

      for (const bus of buses) {
        await db.collection('buses').doc(bus.id).set(bus);
      }
      console.log('Buses migrated successfully.');
    } else {
      console.log('No buses.json file found.');
    }

    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

migrateData();

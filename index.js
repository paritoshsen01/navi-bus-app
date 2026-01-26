const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { db } = require('../firebase-config');

const app = express();

app.use(cors());
app.use(express.json());

// Multer setup for file uploads - use /tmp for Vercel serverless
const upload = multer({ dest: '/tmp/' });

// Firebase collection references
const busDriversCollection = db.collection('busDrivers');
const busesCollection = db.collection('buses');

// Admin password for simple authentication
const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password

// Endpoint to register bus driver (no file uploads)
app.post('/bus-register', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Create new bus driver entry
    const newDriver = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // Save to Firestore
    await busDriversCollection.doc(newDriver.id).set(newDriver);

    res.json({ success: true, message: 'Registration submitted successfully', id: newDriver.id });
  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware for admin authentication
function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get pending bus driver verifications
app.get('/admin/pending-verifications', adminAuth, async (req, res) => {
  try {
    const snapshot = await busDriversCollection.where('status', '==', 'pending').get();
    const pending = [];
    snapshot.forEach(doc => {
      pending.push({ id: doc.id, ...doc.data() });
    });
    res.json(pending);
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bus driver verifications
app.get('/admin/verifications', adminAuth, async (req, res) => {
  try {
    const snapshot = await busDriversCollection.get();
    const allDrivers = [];
    snapshot.forEach(doc => {
      allDrivers.push({ id: doc.id, ...doc.data() });
    });
    res.json(allDrivers);
  } catch (error) {
    console.error('Error fetching all verifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve bus driver verification
app.post('/admin/approve-verification', adminAuth, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const driverRef = busDriversCollection.doc(id);
    const driverDoc = await driverRef.get();
    if (!driverDoc.exists) return res.status(404).json({ error: 'Driver not found' });

    await driverRef.update({ status: 'approved' });
    res.json({ success: true, message: 'Driver approved' });
  } catch (error) {
    console.error('Error approving driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject bus driver verification
app.post('/admin/reject-verification', adminAuth, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const driverRef = busDriversCollection.doc(id);
    const driverDoc = await driverRef.get();
    if (!driverDoc.exists) return res.status(404).json({ error: 'Driver not found' });

    await driverRef.update({ status: 'rejected' });
    res.json({ success: true, message: 'Driver rejected' });
  } catch (error) {
    console.error('Error rejecting driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bus driver status by ID
app.get('/bus-driver-status', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const driverDoc = await busDriversCollection.doc(id).get();
    if (!driverDoc.exists) return res.status(404).json({ error: 'Driver not found' });

    const driver = driverDoc.data();
    res.json({
      id: driverDoc.id,
      name: driver.name,
      status: driver.status
    });
  } catch (error) {
    console.error('Error fetching driver status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Note: File system operations are not needed in serverless environment
// All data is stored in Firebase Firestore

// Add a new bus for a driver (no photo required)
app.post('/bus/add', async (req, res) => {
  try {
    const { driverId, busNumber, startPoint, endPoint, stops, times } = req.body;
    if (!driverId || !busNumber || !startPoint || !endPoint) {
      return res.status(400).json({ error: 'Driver ID, bus number, start point, and end point are required' });
    }

    const newBus = {
      id: Date.now().toString(),
      driverId,
      busNumber,
      startPoint,
      endPoint,
      stops: stops ? JSON.parse(stops) : [], // optional array
      times: times ? JSON.parse(times) : [], // optional array
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    await busesCollection.doc(newBus.id).set(newBus);

    res.json({ success: true, message: 'Bus added successfully', busId: newBus.id });
  } catch (error) {
    console.error('Error adding bus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get buses for a driver
app.get('/bus/list', async (req, res) => {
  try {
    const { driverId } = req.query;
    if (!driverId) return res.status(400).json({ error: 'driverId is required' });

    const snapshot = await busesCollection.where('driverId', '==', driverId).get();
    const driverBuses = [];
    snapshot.forEach(doc => {
      driverBuses.push({ id: doc.id, ...doc.data() });
    });
    res.json(driverBuses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a bus by ID
app.delete('/bus/delete', async (req, res) => {
  try {
    const { busId } = req.body;
    if (!busId) return res.status(400).json({ error: 'busId is required' });

    const busRef = busesCollection.doc(busId);
    const busDoc = await busRef.get();
    if (!busDoc.exists) return res.status(404).json({ error: 'Bus not found' });

    await busRef.delete();
    res.json({ success: true, message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search buses by route
app.get('/bus/search', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to are required' });

    const snapshot = await busesCollection.where('startPoint', '==', from).where('endPoint', '==', to).get();
    const matchingBuses = [];
    snapshot.forEach(doc => {
      matchingBuses.push({ id: doc.id, ...doc.data() });
    });
    res.json(matchingBuses);
  } catch (error) {
    console.error('Error searching buses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;

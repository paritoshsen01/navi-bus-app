const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(__dirname));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Load bus drivers data
const busDriversFile = path.join(__dirname, 'busDrivers.json');
function loadBusDrivers() {
  if (!fs.existsSync(busDriversFile)) {
    fs.writeFileSync(busDriversFile, '[]');
  }
  const data = fs.readFileSync(busDriversFile);
  return JSON.parse(data);
}
function saveBusDrivers(data) {
  fs.writeFileSync(busDriversFile, JSON.stringify(data, null, 2));
}

// Admin password for simple authentication
const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password

// Endpoint to register bus driver with file uploads
app.post('/bus-register', upload.fields([{ name: 'photo' }, { name: 'license' }]), (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone || !req.files || !req.files.photo || !req.files.license) {
    return res.status(400).json({ error: 'All fields and files are required' });
  }

  const busDrivers = loadBusDrivers();

  // Save file paths
  const photoPath = req.files.photo[0].path;
  const licensePath = req.files.license[0].path;

  // Create new bus driver entry
  const newDriver = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    photo: photoPath,
    license: licensePath,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };

  busDrivers.push(newDriver);
  saveBusDrivers(busDrivers);

  res.json({ success: true, message: 'Registration submitted successfully', id: newDriver.id });
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
app.get('/admin/pending-verifications', adminAuth, (req, res) => {
  const busDrivers = loadBusDrivers();
  const pending = busDrivers.filter(driver => driver.status === 'pending');
  res.json(pending);
});

// Get all bus driver verifications
app.get('/admin/verifications', adminAuth, (req, res) => {
  const busDrivers = loadBusDrivers();
  res.json(busDrivers);
});

// Approve bus driver verification
app.post('/admin/approve-verification', adminAuth, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  const busDrivers = loadBusDrivers();
  const driver = busDrivers.find(d => d.id === id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  driver.status = 'approved';
  saveBusDrivers(busDrivers);
  res.json({ success: true, message: 'Driver approved' });
});

// Reject bus driver verification
app.post('/admin/reject-verification', adminAuth, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  const busDrivers = loadBusDrivers();
  const driver = busDrivers.find(d => d.id === id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  driver.status = 'rejected';
  saveBusDrivers(busDrivers);
  res.json({ success: true, message: 'Driver rejected' });
});

// Get bus driver status by ID
app.get('/bus-driver-status', (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  const busDrivers = loadBusDrivers();
  const driver = busDrivers.find(d => d.id === id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  res.json({
    id: driver.id,
    name: driver.name,
    status: driver.status
  });
});

const busesFile = path.join(__dirname, 'buses.json');

function loadBuses() {
  if (!fs.existsSync(busesFile)) {
    fs.writeFileSync(busesFile, '[]');
  }
  const data = fs.readFileSync(busesFile);
  return JSON.parse(data);
}

function saveBuses(data) {
  fs.writeFileSync(busesFile, JSON.stringify(data, null, 2));
}

// Add a new bus for a driver
app.post('/bus/add', upload.single('photo'), (req, res) => {
  const { driverId, busNumber, startPoint, endPoint, stops, times } = req.body;
  if (!driverId || !busNumber || !startPoint || !endPoint || !req.file) {
    return res.status(400).json({ error: 'All fields and photo are required' });
  }

  const buses = loadBuses();

  const newBus = {
    id: Date.now().toString(),
    driverId,
    busNumber,
    startPoint,
    endPoint,
    stops: stops ? JSON.parse(stops) : [], // optional array
    times: times ? JSON.parse(times) : [], // optional array
    photo: req.file.path,
    createdAt: new Date().toISOString()
  };

  buses.push(newBus);
  saveBuses(buses);

  res.json({ success: true, message: 'Bus added successfully', busId: newBus.id });
});

// Get buses for a driver
app.get('/bus/list', (req, res) => {
  const { driverId } = req.query;
  if (!driverId) return res.status(400).json({ error: 'driverId is required' });

  const buses = loadBuses();
  const driverBuses = buses.filter(bus => bus.driverId === driverId);
  res.json(driverBuses);
});

// Delete a bus by ID
app.delete('/bus/delete', (req, res) => {
  const { busId } = req.body;
  if (!busId) return res.status(400).json({ error: 'busId is required' });

  let buses = loadBuses();
  const busIndex = buses.findIndex(bus => bus.id === busId);
  if (busIndex === -1) return res.status(404).json({ error: 'Bus not found' });

  buses.splice(busIndex, 1);
  saveBuses(buses);

  res.json({ success: true, message: 'Bus deleted successfully' });
});

// Search buses by route
app.get('/bus/search', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to are required' });

  const buses = loadBuses();
  const matchingBuses = buses.filter(bus => bus.startPoint === from && bus.endPoint === to);
  res.json(matchingBuses);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;

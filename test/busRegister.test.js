const request = require('supertest');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = require('../server'); // Assuming server.js exports the app

describe('Bus Driver Registration API', () => {
  it('should register a new bus driver successfully', async () => {
    const res = await request(app)
      .post('/bus-register')
      .field('name', 'Test Driver')
      .field('email', 'testdriver@example.com')
      .field('phone', '1234567890')
      .attach('photo', path.join(__dirname, 'test-photo.png'))
      .attach('license', path.join(__dirname, 'test-license.png'));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('id');
  });

  it('should fail registration if required fields are missing', async () => {
    const res = await request(app)
      .post('/bus-register')
      .field('name', '')
      .field('email', '')
      .field('phone', '')
      .attach('photo', path.join(__dirname, 'test-photo.png'))
      .attach('license', path.join(__dirname, 'test-license.png'));

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should fail registration if files are missing', async () => {
    const res = await request(app)
      .post('/bus-register')
      .field('name', 'Test Driver')
      .field('email', 'testdriver@example.com')
      .field('phone', '1234567890');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});

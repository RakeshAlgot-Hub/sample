// scripts/print-backend-url.js
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.BACKEND_API_URL || 'NOT SET';
console.log('[DEV] Using backend API URL:', url);

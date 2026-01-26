require('dotenv').config();
console.log('KEYS:', Object.keys(process.env).filter(k => ['DATABASE_URL', 'PORT'].includes(k)));

// routes/index.js

import { registerController, loginController, logoutController } from '../controllers/authController.js'; 
import { getAllUsers } from '../controllers/usersController.js';
import { servePage } from '../index.js'; // Assuming index.js is your server file

export const routes = {
  // --- Public-only routes (users should be logged OUT) ---
   'GET /':                { publicOnly: true, handler: servePage('public.html') },
  'GET /login':           { publicOnly: true, handler: servePage('login.html') },    // <-- ADD THIS LINE
  'GET /register':     { publicOnly: true, handler: servePage('register.html') },

  'POST /api/register':   { publicOnly: true, handler: registerController },
  'POST /api/login':      { publicOnly: true, handler: loginController },

  // --- Protected API routes (users must be logged IN) ---
  'GET /api/logout':      { protected: true, handler: logoutController },
  'GET /api/users':       { protected: true, handler: getAllUsers },

  // --- Protected frontend page routes ---
  'GET /dashboard':       { protected: true, handler: servePage('index.html') },
  'GET /users':           { protected: true, handler: servePage('index.html') },
  'GET /settings':        { protected: true, handler: servePage('index.html') },
  'GET /profile':         { protected: true, handler: servePage('index.html') },
};

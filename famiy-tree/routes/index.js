// routes/index.js

import { registerController, loginController, logoutController } from '../controllers/authController.js'; 
import { getAllUsers, getUserById, updateUser, deleteUser, createUser } from '../controllers/usersController.js';
import { servePage } from '../index.js'; // Assuming your server file is index.js

// The fix is to use an array of objects `[]` instead of a single object `{}`
export const routes = [
  // --- Page Routes ---
  { method: 'GET', path: '/',                publicOnly: true, handler: servePage('public.html') },
  { method: 'GET', path: '/login',           publicOnly: true, handler: servePage('login.html') },
  { method: 'GET', path: '/register',        publicOnly: true, handler: servePage('register.html') },
  { method: 'GET', path: '/dashboard',       protected: true,  handler: servePage('index.html') },
  { method: 'GET', path: '/users',           protected: true,  handler: servePage('index.html') },
  { method: 'GET', path: '/settings',        protected: true,  handler: servePage('index.html') },
  { method: 'GET', path: '/profile',         protected: true,  handler: servePage('index.html') },
  
  // --- Auth API Routes ---
  { method: 'POST', path: '/api/register',   publicOnly: true, handler: registerController },
  { method: 'POST', path: '/api/login',      publicOnly: true, handler: loginController },
  { method: 'GET',  path: '/api/logout',     protected: true,  handler: logoutController },

  // --- User CRUD API Routes ---
  { method: 'GET',    path: '/api/users',      protected: true,  handler: getAllUsers },
  { method: 'POST',   path: '/api/users/register',      protected: true,  handler: createUser },
  { method: 'GET',    path: '/api/users/:id',  protected: true,  handler: getUserById },
  { method: 'PUT',    path: '/api/users/:id',  protected: true,  handler: updateUser },
  { method: 'DELETE', path: '/api/users/:id',  protected: true,  handler: deleteUser },
];

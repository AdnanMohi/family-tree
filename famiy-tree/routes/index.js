import { handleRegister } from './auth.js';
import { GetAllUsers } from './dashboard.js';
import { handleLogin } from './auth.js';
import { handleLogout } from './auth.js';

export const routes = {
  'POST /register': handleRegister,
  'GET /dashboard-data': GetAllUsers,
  'POST /login': handleLogin, 
  'POST /logout': handleLogout,
  
};
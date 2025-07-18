import { handleRegister } from './auth.js';
import { GetAllUsers } from './dashboard.js';

export const routes = {
  'POST /register': handleRegister,
  'GET /dashboard-data': GetAllUsers,
  
  // add more routes here
};
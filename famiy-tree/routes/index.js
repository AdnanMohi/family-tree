import { registerController , loginController, logoutController } from '../controllers/authController.js'; 
import { getAllUsers } from '../controllers/usersController.js';


export const routes = {
  'POST /api/register': registerController,
  'POST /api/login': loginController,
  'POST /api/logout': logoutController,
  'GET /api/users': getAllUsers
  
};
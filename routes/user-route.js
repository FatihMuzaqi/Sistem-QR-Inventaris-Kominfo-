import { deleteUser, Login, Logout, postAdminUser, postData, Register, updateUser } from "../controllers/user-controller.js";
import express from "express"

const route = express.Router()

route.get('/users', postData);
route.post('/users', Register);
route.post('/login', Login);
route.post('/logout', Logout);
route.post('/admin-post-user', postAdminUser);
route.post('/users/update/:id', updateUser);
route.post('/users/delete/:id', deleteUser);
export default route;
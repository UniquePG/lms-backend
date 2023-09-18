import { Router } from "express";
import { changePasword, forgotPassword, getProfile, login, logout, register, resetPassword, updateUser } from "../controllers/user.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post('/register',upload.single("avatar"), register);    // file upload ke key 'avatar hogi
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn, getProfile);

//forgot password flow
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);

router.post('/change-password', isLoggedIn, changePasword);
router.put('/update/:id', isLoggedIn, upload.single("avatar"), updateUser );


export default router;
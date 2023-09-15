import { Router } from "express"
import { authorizationRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import { contactUs, userStats } from "../controllers/Misllenious.controllers.js";

const router = Router();

router.route("/contact").post(contactUs);

router
  .route('/admin/stats/users')
  .get(isLoggedIn, authorizationRoles('ADMIN'), userStats);



export default router
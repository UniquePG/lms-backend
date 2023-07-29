import { Router } from 'express';
import { getAllCourses, getLecturesByCourseId } from '../controllers/course.controllers';
import { isLoggedIn } from '../middlewares/auth.middleware';

const router = Router();

// router.route('/').get(getAllCourses); //! this method is used when we want to hit multiple routes (get, post)

// router.get('/:id', getLecturesByCourseId);

router.get('/', getAllCourses);
router.route('/:id').get(isLoggedIn ,getLecturesByCourseId);




export default router;
import { Router } from 'express';
import { addLecturesToCourseById, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from '../controllers/course.controllers.js';
import { authorizationRoles, authorizedSubscriber, isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

// router.get('/', getAllCourses);

// router.get('/:id', getLecturesByCourseId);

//! this method is used when we want to hit multiple routes (get, post, put etc...)

    //* in create course we dont need course id
router.route('/')
    .get(getAllCourses)
    .post( isLoggedIn,
        authorizationRoles('ADMIN'), 
        upload.single('thumbnail'), 
        createCourse);    

    //* in update and delete we need course id
router.route('/:id')
    .get(isLoggedIn, authorizedSubscriber, getLecturesByCourseId)
    .put(isLoggedIn,
        authorizationRoles('ADMIN'), 
        updateCourse)         
    .delete( isLoggedIn,
        authorizationRoles('ADMIN'), 
        removeCourse)
    .post( isLoggedIn,
        authorizationRoles('ADMIN'), 
        upload.single('lecture'), 
        addLecturesToCourseById
    );          
    
    // router.delete('/deleteLecture/:id',
    //     isLoggedIn,
    //     authorizationRoles('ADMIN'), 
    //     deleteLecture
    //     );


export default router;
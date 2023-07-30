import { config } from "dotenv";
config();
import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises'

const getAllCourses = async (req, res, next) => {
    
    try {
    // we want only course detail not lectures(so we remove lectures)
    const courses = await Course.find({}).select('-lectures');

    res.status(200).json({
        success: true,
        message: "all courses",
        courses,
    })   

    } catch (error) {
        return new AppError("Error while fetching courses", 404)
    }





}


const getLecturesByCourseId = async (req, res, next) => {

    try {
        const { id } = req.params;
        // console.log(id);     // for debugging

        const course = await Course.findById(id);
        // console.log(id);     // for debugging

        if(!course){
            return new AppError("Courses not found", 400)
        }

        res.status(200).json({
            success: true,
            message: "Course lectures successfully",
            lectures: course.lectures
        })


    } catch (error) {
        return new AppError("Error while fetching lectures", 404)
    }

}


//! admin roles -> create, update, delete course
const createCourse = async (req, res, next) => {
    
    const { title, description, category, createdBy } = req.body;

    if(!title || !description || !category || !createdBy){
        return next(new AppError("All fields are mandatory", 400));

    }


        
            // store couse detail in db
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: "dummy",
            secure_url: "dummy"
        }
    })

    if(!course) {
        return next( new AppError("Course could not created, please try again", 400))
    }

    if(req.file){
        try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms'
        });

        if(result){
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
        }

        fs.rm(`uploads/${req.file.filename}`)

    } catch (error) {
        return next(new AppError(error.message, 400));
    }
    }

    await course.save();    // save course in db

    res.status(200).json({
        success: true,
        message: "Course created successfully",
        course,
    });
        

}

const updateCourse = async (req, res, next) => {

    try {
        // get course id from req params
        const { id } = req.params;

        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body    // set(update) all value provided from body
            },
            {
                runValidators: true    // it validates ke jo naya data a rha h bo sahi h yaa nh (mongo course structure ke according)
            }
        )

        console.log(course);
        if(!course){
            return next(new AppError("Course with given id does not exists", 400));
        }

        res.status(200).json({
            success: true,
            message: "course updated successfully",
            course,
        })

    } catch (error) {
        return next(new AppError(error.message, 400));
    }

}

const removeCourse = async (req, res, next) => {

    try {
        const { id }  = req.params;

        const course = await Course.findById(id);

        if(!course){
            return next(new AppError("Course with given id does not exists", 400));
        }

        await Course.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })


    }catch (error) {
        return next(new AppError(error.message, 400));
    }

}

const addLecturesToCourseById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { title, description} = req.body;
    
        if(!title || !description){
            return next(new AppError("All fields are mandatory", 400))
        }
    
        const course = await Course.findById(id);
    
        if(!course){
            return next(new AppError("Course does not exists", 400))
        }
    
        const lectureData = {
            title,
            description,
            lecture: {}
        }
    
        if(req.file){
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms'
                });
        
                if(result){
                    lectureData.lecture.public_id = result.public_id;
                    lectureData.lecture.secure_url = result.secure_url;
                }
        
                fs.rm(`uploads/${req.file.filename}`)
        
            } catch (error) {
                return next(new AppError(error.message, 400));
            }
        }
    
        course.lectures.push(lectureData);
        course.numbersOfLectures = course.lectures.length;
    
        await course.save();
    
        res.status(200).json({
            success: true,
            message: "Lecture is added successfully",
            course,
        })

    } catch (error) {
        return next(new AppError(error.message, 402));
    }


}


//todo-> Delete lecture
// const deleteLecture = async (req, res, next) => {

//     try {
//             const { id } = req.params;

//             const course = await Course.findById(id)

//             if(!course){
//                 return next(new AppError("Course does not exists", 400))
//             }

//             const lectureData = course.lectures;

//             const lectureId = lectureData._id



//     } catch (error) {
//         return next(new AppError(error.message, 400));
//     }

// }


export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLecturesToCourseById,
    // deleteLecture
}
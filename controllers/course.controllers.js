import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";

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

export {
    getAllCourses,
    getLecturesByCourseId,
}
import { Schema, model } from "mongoose";

const courseModel = new Schema({
    title: {
        type: String,
        required: [true, "title is required"],
        minLength: [8, "title must be atlest 8 characters"],
        maxLength: [60, "title should be less than 60 characters"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "description is required"],
        minLength: [8, "description must be atlest 8 characters"],
        maxLength: [500, "description should be less than 60 characters"],
        trim: true,
    },
    category: {
        type: String,
        required: [true, "category is required"],
    },
    thumbnail: {
        public_id: {
            type: String,
            required: [true, "public id is required"],
        },
        secure_url: {
            type: String,
            required: [true, "secure url is required"],
        }
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true,
                },
                secure_url: {
                    type: String,
                    required: true
                }
            },
        }
    ],

    numbersOfLectures: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        required: true
    }

    
}, {
    timestamps: true
});


const Course = model("Course", courseModel);

export default Course
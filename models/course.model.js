import { Model, Schema } from "mongoose";

const courseModel = new Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    
})
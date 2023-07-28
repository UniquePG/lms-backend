import { config } from 'dotenv'
config();

import mongoose from "mongoose";

//* agar ek hat parameter km paas ho to error naa de (string mode me nh krenge)
mongoose.set('strictQuery', false);

const ConnectToDb = async ()=>{

    try {
        
        const { connection } = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms_project', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    
        if(connection){
            console.log(`Connected to MongoDB : ${connection.host}`);
        }

    } catch (error) {
        console.log(error);
        process.exit(1);  // yha se pura terminate ho jayegaa (sever bgera)
    }

}

export default ConnectToDb;
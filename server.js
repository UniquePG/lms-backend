
import cloudinary from 'cloudinary';
import app from './app.js';
import ConnectToDb from './config/DbConn.js';
import Razorpay from 'razorpay';

const PORT = process.env.PORT || 5001;


    //* Cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


// razorpay configuration
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    secret_key: process.env.RAZORPAY_SECRET
})


app.listen(PORT, async ()=>{
    await ConnectToDb();    // connection to db
    
    console.log(`Server is running on http://localhost:${PORT}`);


})
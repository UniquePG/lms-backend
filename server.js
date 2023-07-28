
import cloudinary from 'cloudinary';
import app from './app.js';
import ConnectToDb from './config/DbConn.js';

const PORT = process.env.PORT || 5001;


    //* Cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


app.listen(PORT, async ()=>{

    console.log(`Server is running on http://localhost:${PORT}`);

    await ConnectToDb();    // connection to db

})
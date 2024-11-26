import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const DBconnect= async ()=> {
    try {
        const DBConnection= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // const DBConnection= await mongoose.connect("mongodb://localhost:27017/videotube");
        console.log(`Connecting to ${DBConnection.connection.host}`);
    } catch (error) {
        console.error("ERROR:",error);
        process.exit(1);
    }
}

export default DBconnect;
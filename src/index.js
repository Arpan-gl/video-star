import dotenv from 'dotenv';
import {app} from './app.js';
import DBconnect from './db/index.js';

dotenv.config(
    {path: "./.env"}
);

DBconnect()
.then(()=>{
    app.on("error",(err)=>{
        console.error("Server error",err);
        process.exit(1);
    })
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.error("Error connecting to DB",err);
})
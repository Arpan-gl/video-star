import dotenv from 'dotenv';
import {app} from './app.js';
import DBconnect from './db/index.js';

dotenv.config(
    {path: "./.env"}
);

DBconnect();


import * as dotenv from 'dotenv';
import * as http from 'http';
import app from './app';
import logger from './utils/logger';
dotenv.config();
const PORT = process.env.PORT || 5050;
const serverHttp = http.createServer(app);
serverHttp.listen(PORT, () => {
    console.log(`Http server is running on port : ${PORT}`);
    logger.info(`${process.env.PROJECT} app listening on port : ${PORT}`);
});
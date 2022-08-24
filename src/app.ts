import "reflect-metadata";
import express, { Application } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import Router from "./routes";
import errorHandler from "./middlewares/error.handler";
import bodyParser from "body-parser";
import { initTable, deleteTable } from "./utils/utils";
import { USERS_TABLE_NAME } from "./constants";
initTable(USERS_TABLE_NAME);
// deleteTable(USERS_TABLE_NAME)
const app: Application = express();
app.use(express.json());
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan("tiny"));
app.use(express.static("public"));

app.use(
  "/api/v1/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.use(Router);
app.use(errorHandler)

export = app;

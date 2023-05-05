import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import { preparePayload, runRequest } from "./utils/request";
import * as ngrok from "@ngrok/ngrok";
import http from "http";

const appNode = (port: string, cfPackagePath: string) => {
  const app: Express = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const payload = preparePayload(req);
    console.log("payload", payload.body)
    const resp = await runRequest(cfPackagePath, payload);
    console.log("Response", resp)
    res.json(resp);
  });

  http.createServer(app).listen(port, async () => {
    const url = await ngrok.connect(port);
    console.log(`🚀 Server ready at ${url}`);
  });
};

export default appNode;

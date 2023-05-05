import { Request } from "express";
import { pickBy } from "lodash";
import childProcess from "child_process";
import path from "path";

type FnPayload = {
  headers: {
    Authorization: string;
    [key: string]: string | undefined;
  };
  querystring: string | null;
  method: string;
  path: string;
  body: JSON;
};

type ChildMessage =
  | { type: "init" }
  | { type: "response"; data: any }
  | { type: "error"; data: any };

const SKED_HEADERS_PREFIX = "sked-";

export const preparePayload = (req: Request): FnPayload => {
  const fnPayload: FnPayload = {
    headers: {
      ...pickBy(req.headers, (_value, key) =>
        key.toLowerCase().startsWith(SKED_HEADERS_PREFIX)
      ),
      Authorization: req.headers.authorization || "",
      "sked-api-server": req.headers["sked-api-server"] as string,
      "Content-Type": req.headers["content-type"],
    },
    method: req.method,
    querystring: "",
    path: req.path,
    body: req.body,
  };
  return fnPayload;
};

export const runRequest = async <T>(bundlePath: string, payload: FnPayload) => {
  console.log("creating child process");
  return new Promise((resolve, reject) => {
    const child = childProcess.fork(path.join(__dirname, "../lambda-dev"), [], {
      cwd: bundlePath,
      stdio: ["pipe", "pipe", "pipe", "ipc"],
      execArgv: ["--inspect-brk=9999"],
    });

    if (!child) {
      reject(new Error("Unable to fork new process to run request"));
    }

    const killChildProcess = () => {
      child?.kill();
    };

    child.on("message", (msg) => {
      const parsed = JSON.parse(msg as string) as ChildMessage;

      switch (parsed.type) {
        case "init":
          console.log("Sending request to child process");
          child.send(JSON.stringify({ type: "request", data: payload }));
          break;
        case "response":
          resolve(parsed.data);
          killChildProcess();
          break;
        case "error":
          console.error("Error in child process", parsed);
          reject(parsed);
          killChildProcess();
          break;
        default:
          throw new Error("Unknown response received");
      }
    });
  });
};

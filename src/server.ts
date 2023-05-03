import { Hono } from "https://deno.land/x/hono@v3.1.7/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { zValidator } from "./middleware/validator.ts";
import { bearerAuth } from "https://deno.land/x/hono@v3.1.7/middleware/bearer-auth/index.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const app = new Hono();

app.use("/*", (c, next) => {
  const token = Deno.env.get("TOKEN") || "";
  const auth = bearerAuth({ token });
  return auth(c, next);
});

import {
  putUser,
  putUserBodySchema,
  putUserParamSchema,
} from "./controller/users.ts";
app.put(
  "/v1/users/:id",
  zValidator("param", putUserParamSchema),
  zValidator("json", putUserBodySchema),
  putUser,
);

import { postUser } from "./controller/users.ts";
app.post(
  "/v1/users",
  postUser,
);

// import { getUsers } from './controller/users.ts';
// app.get('/v1/users', getUsers);

import { getUser, getUserRequestSchema } from "./controller/users.ts";
app.get(
  "/v1/users/:id",
  zValidator(
    "param",
    getUserRequestSchema,
  ),
  getUser,
);

import {
  getUserGameResults,
  getUserGameResultsRequestSchema,
} from "./controller/users.ts";
app.get(
  "/v1/users/:user/gameresults",
  zValidator("param", getUserGameResultsRequestSchema),
  getUserGameResults,
);

import { getGameResult } from "./controller/users.ts";
app.get("/v1/users/:user/gameresults/:gamenum", getGameResult);

import {
  saveGameResultRequestSchema,
  saveGameResults,
} from "./controller/users.ts";
app.put(
  "/v1/users/:user/gameresults/:gamenum",
  zValidator("json", saveGameResultRequestSchema),
  saveGameResults,
);

serve(app.fetch);

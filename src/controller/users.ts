import { MiddlewareHandler } from "https://deno.land/x/hono@v3.1.7/mod.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

const githubIdSchema = z.coerce.number({
  invalid_type_error: "id must be numeric.",
}).int().positive();

export const putUserBodySchema = z.object({
  username: z.string(),
});
export const putUserParamSchema = z.object({
  id: githubIdSchema,
});

const kv = await Deno.openKv();

export const putUser: MiddlewareHandler = async (c) => {
  const { username } = c.req.valid("json");
  const { id } = c.req.valid("param");
  const res = await kv
    .atomic()
    .set(["users", id], { username })
    .set(["ids_by_username", username], { id })
    .commit();
  if (!res?.versionstamp) {
    return c.text("oh no", 500);
  }

  return c.text("created", 201);
};

export const postUser: MiddlewareHandler = async (c) => {
  const { username, github_id } = await c.req.json();
  await kv
    .atomic()
    .set(["users", github_id], { username })
    .set(["ids_by_username", username], { id: github_id })
    .commit();
  return c.text("created", 201);
};

export const getUsers: MiddlewareHandler = async (c) => {
  const iter = await kv.list({ prefix: ["users"] });
  const users: any = [];
  for await (const res of iter) {
    users.push({
      ...res.value,
      id: res.key.at(1),
    });
  }
  return c.json(users);
};

export const getUserRequestSchema = z.object({
  id: githubIdSchema,
});

export const getUser: MiddlewareHandler = async (c) => {
  const { id } = c.req.valid("param");
  const res = await kv.get(["users", id]);
  if (!res.versionstamp) {
    return c.text("Not found", 404);
  }
  const user = {
    ...res.value,
    id,
  };
  return c.json(user);
};

export const getUserGameResultsRequestSchema = z.object({
  user: z.string(),
});

export const getUserGameResults: MiddlewareHandler = async (c) => {
  const { user } = c.req.valid("param");
  const idRes = await kv.get(["ids_by_username", user]);
  const { id } = idRes.value;
  const iter = await kv.list({ prefix: ["users", id, "game_results"] });
  const gameResults = [];
  for await (const res of iter) {
    gameResults.push({
      ...res.value,
      gamenum: res.key.at(-1),
    });
  }
  return c.json({
    results: gameResults,
  });
};

export const getGameResult: MiddlewareHandler = async (c) => {
  const user = c.req.param("user");
  const gamenum = Number(c.req.param("gamenum"));
  const idRes = await kv.get(["ids_by_username", user]);
  const { id } = idRes.value;
  const res = await kv.get([
    "users",
    id,
    "game_results",
    gamenum,
  ]);
  return c.json(res.value);
};

export const saveGameResultRequestSchema = z.object({
  answers: z.string(),
  attempts: z.number(),
});

export const saveGameResults: MiddlewareHandler = async (c) => {
  const { attempts, answers } = c.req.valid("json") as {
    attempts: number;
    answers: string;
  };
  const { user } = c.req.param();
  const idRes = await kv.get(["ids_by_username", user]);
  const { id } = idRes.value;
  const gamenum = Number(c.req.param("gamenum"));
  const primaryKey = ["users", id, "game_results", gamenum];
  const secondaryKey = ["game_results_by_gamenum", gamenum, id];
  const gameResult = {
    answers,
    attempts,
  };
  await kv.atomic()
    .set(primaryKey, gameResult)
    .set(secondaryKey, gameResult)
    .commit();
  return c.text("created", 201);
};

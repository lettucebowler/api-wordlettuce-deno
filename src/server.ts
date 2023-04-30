import { Hono } from "https://deno.land/x/hono@v3.1.7/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { zValidator } from './middleware/validator.ts';
import { bearerAuth } from "https://deno.land/x/hono@v3.1.7/middleware/bearer-auth/index.ts";
import "https://deno.land/x/dotenv/load.ts";

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', async (c, next) => {
	const token = Deno.env.get('TOKEN');
	const auth = bearerAuth({ token });
	return auth(c, next);
});

// import { getRankingsRequestSchema, getRankings } from './controller/rankings.ts';
// app.get('/v1/rankings', zValidator('query', getRankingsRequestSchema), getRankings);

import { putUser, putUserParamSchema, putUserBodySchema } from './controller/users.ts';
app.put(
	'/v1/users/:id',
	zValidator('param', putUserParamSchema),
	zValidator('json', putUserBodySchema),
	putUser);

import { getUsers } from './controller/users.ts';
app.get('/v1/users', getUsers);

import { getUserRequestSchema, getUser } from './controller/users.ts';
app.get('/v1/users/:id', zValidator('param', getUserRequestSchema), getUser);

// import { getUserGameResults } from './controller/users.ts';
// app.get('/v1/users/:user/gameresults', getUserGameResults);

// import { getGameResult } from './controller/users.ts';
// app.get('/v1/users/:user/gameresults/:gamenum', getGameResult);

// import { saveGameResultRequestSchema, saveGameResults } from './controller/users.ts';
// app.put(
// 	'/v1/users/:user/gameresults/:gamenum',
// 	zValidator('json', saveGameResultRequestSchema),
// 	saveGameResults
// );

serve(app.fetch);

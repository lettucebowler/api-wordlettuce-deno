import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.1.6/mod.ts";
const app = new Hono();

async function whatever(c) {
    const db = await Deno.openKv();
    await db.set(["foo"], "bar");
    await db.set(["bleh"], "bluh");
    const bar = await db.get(["foo"]);
    return c.text(bar.value);
}

app.get('/', (c) => whatever(c));

serve(app.fetch);

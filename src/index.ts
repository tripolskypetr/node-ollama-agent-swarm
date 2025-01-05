import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'

import "./routes/session";
import "./routes/complete";

import { app, injectWebSocket } from './config/app';
import { ioc } from './services';

app.use('/*', serveStatic({ root: './public' }))

const server = serve({
  fetch: app.fetch,
  port: 80,
});

injectWebSocket(server)

console.log("Server listening on http://localhost:80");

ioc.loggerService.setDebug(true);

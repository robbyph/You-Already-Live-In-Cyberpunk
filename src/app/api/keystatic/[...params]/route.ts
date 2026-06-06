import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

export const dynamic = "force-dynamic";

const handler =
  config.storage.kind === "github" && !process.env.KEYSTATIC_GITHUB_CLIENT_ID
    ? {
        GET: () => new Response("CMS credentials not configured", { status: 503 }),
        POST: () => new Response("CMS credentials not configured", { status: 503 }),
      }
    : makeRouteHandler({ config });

export const { GET, POST } = handler;

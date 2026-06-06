import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

export const dynamic = "force-dynamic";

function createHandler() {
  if (
    config.storage.kind === "github" &&
    !process.env.KEYSTATIC_GITHUB_CLIENT_ID
  ) {
    return {
      GET: () =>
        new Response("CMS credentials not configured", { status: 503 }),
      POST: () =>
        new Response("CMS credentials not configured", { status: 503 }),
    };
  }

  return makeRouteHandler({
    config,
    clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: process.env.KEYSTATIC_SECRET,
  });
}

const handler = createHandler();
export const { GET, POST } = handler;

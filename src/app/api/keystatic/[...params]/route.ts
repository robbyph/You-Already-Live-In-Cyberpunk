import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

export const dynamic = "force-dynamic";

function createHandler() {
  if (
    process.env.NODE_ENV === "production" &&
    config.storage.kind === "github" &&
    !process.env.KEYSTATIC_GITHUB_CLIENT_ID
  ) {
    const stub = () =>
      new Response("CMS credentials not configured", { status: 503 });
    return { GET: stub, POST: stub };
  }
  return makeRouteHandler({ config });
}

export const { GET, POST } = createHandler();

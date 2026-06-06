import { config, fields, collection } from "@keystatic/core";
import { imageWithCrop } from "./src/keystatic/image-with-crop";

export default config({
  storage:
    process.env.NODE_ENV === "production"
      ? {
          kind: "github",
          repo: {
            owner:
              process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER ?? "robbyph",
            name:
              process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO ??
              "You-Already-Live-In-Cyberpunk",
          },
        }
      : { kind: "local" },

  collections: {
    entries: collection({
      label: "Entries",
      slugField: "title",
      path: "Entries/*/",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),

        description: fields.text({
          label: "Description",
          multiline: true,
        }),

        image: imageWithCrop({ label: "Image" }),

        link: fields.url({ label: "Link" }),
      },
    }),
  },
});

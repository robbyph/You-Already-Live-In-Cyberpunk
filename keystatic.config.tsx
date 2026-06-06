import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: process.env.KEYSTATIC_GITHUB_CLIENT_ID
    ? {
        kind: "github",
        repo: {
          owner: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER ?? "robbyph",
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

        localImage: fields.text({ label: "Image Filename" }),

        links: fields.array(fields.url({ label: "URL" }), {
          label: "Links",
          itemLabel: (props) => props.value ?? "Link",
        }),

        bookmarks: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({
              label: "Description",
              multiline: true,
            }),
            link: fields.url({ label: "URL" }),
          }),
          {
            label: "Bookmarks",
            itemLabel: (props) => props.fields.title.value || "Bookmark",
          }
        ),

        notes: fields.array(fields.text({ label: "Note", multiline: true }), {
          label: "Notes",
          itemLabel: (props) => {
            const val = props.value ?? "";
            return val.length > 60 ? val.slice(0, 60) + "..." : val || "Note";
          },
        }),

        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value || "Tag",
        }),

        date: fields.date({ label: "Date" }),

        checked: fields.checkbox({ label: "Checked", defaultValue: false }),

        needsReview: fields.checkbox({
          label: "Needs Review",
          defaultValue: false,
        }),

        reviewReason: fields.text({ label: "Review Reason" }),

        // Legacy fields from Notion import - preserved for data integrity
        id: fields.text({ label: "ID (legacy)" }),

        notionPageId: fields.text({ label: "Notion Page ID (legacy)" }),

        media: fields.array(
          fields.object({
            localPath: fields.text({ label: "Local Path" }),
            originalFilename: fields.text({ label: "Original Filename" }),
            sourcePath: fields.text({ label: "Source Path" }),
            type: fields.text({ label: "Type" }),
          }),
          {
            label: "Media (legacy)",
            itemLabel: (props) =>
              props.fields.localPath.value || "Media item",
          }
        ),

        source: fields.text({ label: "Source (legacy)" }),

        sourceHtml: fields.text({ label: "Source HTML (legacy)" }),
      },
    }),
  },
});

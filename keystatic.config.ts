import { config, fields, collection } from "@keystatic/core";

export default config({
  // Local mode has no authentication, so it's only used for development.
  // In production, editors sign in with GitHub and edits are committed to the
  // repo. The same GitHub session also gates the feature flags admin.
  storage:
    process.env.NODE_ENV === "development"
      ? { kind: "local" }
      : { kind: "github", repo: "plsr/website" },
  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
        description: fields.text({ label: "Description" }),
        hidden: fields.checkbox({
          label: "Hidden",
          description: "Exclude from the post list",
        }),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "public/images/posts",
              publicPath: "/images/posts/",
            },
          },
        }),
      },
    }),
    notes: collection({
      label: "Notes",
      slugField: "title",
      path: "content/notes/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
        hidden: fields.checkbox({
          label: "Hidden",
          description: "Exclude from the notes list",
        }),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "public/images/notes",
              publicPath: "/images/notes/",
            },
          },
        }),
      },
    }),
  },
});

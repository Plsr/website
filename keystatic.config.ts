import { config, fields, collection } from "@keystatic/core";

export default config({
  // Local mode has no authentication, so it's only used for development.
  // In production, editors sign in with GitHub and edits are committed to the
  // repo.
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
        tags: fields.array(
          fields.text({ label: "Tag", validation: { isRequired: true } }),
          {
            label: "Tags",
            itemLabel: (props) => props.value,
          },
        ),
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
    books: collection({
      label: "Books",
      slugField: "title",
      path: "content/books/*",
      format: { contentField: "notes" },
      columns: ["title", "author", "status"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        author: fields.text({
          label: "Author",
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Reading", value: "reading" },
            { label: "Read", value: "read" },
            { label: "Abandoned", value: "abandoned" },
          ],
          defaultValue: "read",
        }),
        finished: fields.date({
          label: "Finished",
          description: "When you finished (or gave up on) the book",
        }),
        rating: fields.integer({
          label: "Rating",
          description: "1–5, leave empty for no rating",
          validation: { min: 1, max: 5 },
        }),
        illustration: fields.image({
          label: "Illustration",
          description:
            "Optional header image for the book page. Greyscale engravings in the style of the footer work best.",
          directory: "public/images/books",
          publicPath: "/images/books/",
        }),
        illustrationDark: fields.image({
          label: "Illustration (dark mode)",
          description:
            "Optional night-time variant. Without it, the illustration is inverted in dark mode.",
          directory: "public/images/books",
          publicPath: "/images/books/",
        }),
        hidden: fields.checkbox({
          label: "Hidden",
          description: "Exclude from the books list",
        }),
        notes: fields.markdoc({
          label: "Notes",
          options: {
            image: {
              directory: "public/images/books",
              publicPath: "/images/books/",
            },
          },
        }),
      },
    }),
  },
});

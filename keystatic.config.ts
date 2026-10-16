import { config, fields, collection } from "@keystatic/core";
import { caseStudyContentComponents } from "@/components/case-study/keystatic";

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
    caseStudies: collection({
      label: "Case studies",
      slugField: "title",
      path: "content/case-studies/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
        description: fields.text({ label: "Description" }),
        content: fields.mdx({
          label: "Content",
          components: caseStudyContentComponents,
          options: {
            image: {
              directory: "public/images/case-studies",
              publicPath: "/images/case-studies/",
            },
          },
        }),
      },
    }),
    bookmarks: collection({
      label: "Bookmarks",
      slugField: "title",
      path: "content/bookmarks/*",
      format: { contentField: "notes" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        url: fields.text({
          label: "URL",
          description: "Absolute http(s) URL",
          validation: {
            isRequired: true,
            pattern: {
              regex:
                /^https?:\/\/(?:[^\s/?#@]*@)?(?:\[[0-9a-fA-F:.]+\]|[^\s/?#@:[\]]+)(?::\d{1,5})?(?:[/?#][^\s]*)?$/i,
              message: "Enter an absolute http(s) URL",
            },
          },
        }),
        source: fields.text({
          label: "Source",
          description: "Where it was published, for example the site name",
        }),
        date: fields.date({
          label: "Date",
          description: "Used for sorting only. Not shown on the site.",
          validation: { isRequired: true },
        }),
        hidden: fields.checkbox({
          label: "Hidden",
          description: "Exclude from the bookmarks list",
          defaultValue: false,
        }),
        notes: fields.markdoc({
          label: "Notes",
          options: {
            image: {
              directory: "public/images/bookmarks",
              publicPath: "/images/bookmarks/",
            },
          },
        }),
      },
    }),
  },
});

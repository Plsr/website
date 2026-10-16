import { fields } from "@keystatic/core";
import {
  block,
  wrapper,
  type ContentComponent,
} from "@keystatic/core/content-components";
import {
  calloutTones,
  figureVariants,
  type CaseStudyComponentName,
} from "./options";

/**
 * Editor blocks for the case-study MDX field. Names match
 * `caseStudyComponents` so the admin inserts the same tags the renderer knows.
 */
export const caseStudyContentComponents = {
  Figure: block({
    label: "Figure",
    description:
      "Image with a caption. Wide and full bleed break out of the text column.",
    schema: {
      src: fields.image({
        label: "Image",
        directory: "public/images/case-studies",
        publicPath: "/images/case-studies/",
        validation: { isRequired: true },
      }),
      alt: fields.text({
        label: "Alt text",
        validation: { isRequired: true },
      }),
      caption: fields.text({
        label: "Caption",
        multiline: true,
      }),
      variant: fields.select({
        label: "Width",
        options: figureVariants,
        defaultValue: "content",
      }),
    },
  }),
  Callout: wrapper({
    label: "Callout",
    description: "A short note or warning. The body is rich text.",
    schema: {
      title: fields.text({ label: "Title" }),
      tone: fields.select({
        label: "Tone",
        options: calloutTones,
        defaultValue: "note",
      }),
    },
  }),
} satisfies Record<CaseStudyComponentName, ContentComponent>;

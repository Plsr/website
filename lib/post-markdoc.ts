import { nodes, Tag, type Config, type Node } from "@markdoc/markdoc";

/**
 * Post content is rendered one level below the markdoc source so the page
 * title can be the only h1. A source `#` becomes h2, and `##` becomes h3.
 */
export const postMarkdocConfig: Config = {
  nodes: {
    heading: {
      ...nodes.heading,
      transform(node: Node, config: Config) {
        const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);
        const level = Math.min(node.attributes.level + 1, 6);
        return new Tag(`h${level}`, attributes, children);
      },
    },
  },
};

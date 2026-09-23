import Markdoc, { nodes, Tag, type Node, type Config } from "@markdoc/markdoc";
import React from "react";
import { applyFootnotes } from "@/lib/footnotes";

const markdocConfig = {
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

export function renderMarkdoc(node: Node) {
  const errors = Markdoc.validate(node);
  if (errors.length) throw new Error("Invalid content");

  const renderable = applyFootnotes(Markdoc.transform(node, markdocConfig));
  return Markdoc.renderers.react(renderable, React);
}

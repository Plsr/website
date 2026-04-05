export interface PostMeta {
  title: string;
  date: string;
  description?: string;
  slug: string;
}

export interface Post extends PostMeta {
  html: string;
}

export interface PageMeta {
  title: string;
  slug: string;
  nav: boolean;
}

export interface Page extends PageMeta {
  html: string;
}

export interface LinkMeta {
  title: string;
  date: string;
  url: string;
  slug: string;
}

export interface Link extends LinkMeta {
  html: string;
}

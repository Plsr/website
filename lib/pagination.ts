// Always at least one page, so an empty list still renders page 1.
export function pageCount(itemCount: number, perPage: number) {
  return Math.max(1, Math.ceil(itemCount / perPage));
}

export function pageItems<T>(items: T[], page: number, perPage: number) {
  return items.slice((page - 1) * perPage, page * perPage);
}

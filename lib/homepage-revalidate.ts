const SECRET_KEY = "__homepageRevalidateSecret";

type SecretGlobal = typeof globalThis & {
  [SECRET_KEY]?: string;
};

export function setHomepageRevalidateSecret(secret: string) {
  (globalThis as SecretGlobal)[SECRET_KEY] = secret;
}

export function getHomepageRevalidateSecret() {
  return (globalThis as SecretGlobal)[SECRET_KEY];
}

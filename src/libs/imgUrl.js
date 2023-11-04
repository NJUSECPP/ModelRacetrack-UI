export const getPublicUrl = (filename) => {
  return import.meta.env.BASE_URL + filename;
}

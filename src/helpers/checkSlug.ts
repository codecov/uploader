export function checkSlug(slug: string | undefined): boolean {
  if (slug !== '' && !slug?.match(/\//)) {
    return false
  }
  return true
}

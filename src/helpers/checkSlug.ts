export function checkSlug(slug: string): boolean {
  if (slug !== '' && !slug.match(/\//)) {
    return false
  }
  return true
}

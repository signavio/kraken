/**
 * Returns a function which checks if a given URL starts
 * with the previously provided path parameter.
 */
export default function pathFilter(path: string) {
  return (matchingUrl: string) => matchingUrl.startsWith(path)
}

/**
 * Returns a function which checks if a given URL starts
 * with the previously provided path parameter.
 */
export default function pathFilter(path) {
  return matchingUrl => matchingUrl.indexOf(path) > -1
}

// @flow
import { isMatch, omitBy } from 'lodash'

export default (obj: Object, src: Object): boolean =>
  isMatch(obj, omitBy(src, (value: any) => value === undefined))

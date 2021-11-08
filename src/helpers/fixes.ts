/* eslint-disable no-useless-escape */

/**
 * {@link [codecov#L1614-L1615][1]}
 * 
 * [1]: https://github.com/codecov/codecov-bash/blob/1817ab2/codecov#L1614-L1615
 */
export const empty_line = '^[[:space:]]*$'

/**
 * {@link [codecov#L1616-L1617][1]}
 * 
 * [1]: https://github.com/codecov/codecov-bash/blob/1817ab2/codecov#L1616-L1617
 */
export const syntax_comment = '^[[:space:]]*//.*'

/**
 * {@link [codecov#L1618-L1619][1]}
 * 
 * [1]: https://github.com/codecov/codecov-bash/blob/1817ab2/codecov#L1618-L1619
 */
export const syntax_comment_block = '^[[:space:]]*(\/\*|\*\/)[[:space:]]*$'

/**
 * {@link [codecov#L1620-L1621][1]}
 * 
 * [1]: https://github.com/codecov/codecov-bash/blob/1817ab2/codecov#L1620-L1621
 */
export const syntax_bracket = '^[[:space:]]*[\{\}][[:space:]]*(//.*)?$'

/**
 * {@link [codecov#L1622-L1623][1]}
 * 
 * [1]: https://github.com/codecov/codecov-bash/blob/1817ab2/codecov#L1622-L1623
 */
export const syntax_list = '^[[:space:]]*[][][[:space:]]*(//.*)?$'

/**
 * {@link [codecov#L1624-L1625][1]}
 * 
 * [1]: https://github.com/codecov/codecov-bash/blob/1817ab2/codecov#L1624-L1625
 */
export const syntax_go_func = '^[[:space:]]*func[[:space:]]*[\{][[:space:]]*$'

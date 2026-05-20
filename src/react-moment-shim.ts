// Vite 8's prebundle wraps react-moment's CJS default export an extra level deep,
// so `import Moment from 'react-moment'` resolves to a namespace object instead of
// the class. Unwrap it here and re-expose the class as the default.
import * as ReactMomentModule from 'react-moment/dist/index.js'

type ReactMomentNamespace = { default?: { default?: unknown } | unknown }
const ns = ReactMomentModule as ReactMomentNamespace
const unwrapped = (ns.default && (ns.default as { default?: unknown }).default) ?? ns.default ?? ReactMomentModule

export default unwrapped

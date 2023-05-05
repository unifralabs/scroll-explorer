/**
 * If you need to add transformers for special data types like `Temporal.Instant` or `Temporal.Date`, `Decimal.js`, etc you can do so here.
 * Make sure to import this file rather than `superjson` directly.
 * @see https://github.com/blitz-js/superjson#recipes
 */
import superjson from 'superjson'
import { SuperJSONValue } from 'superjson/dist/types'

export const transformer = {
  input: superjson,
  output: {
    serialize: (object: SuperJSONValue) => {
      // convert bigint to number
      const json = JSON.stringify(object, (key, value) => {
        if (typeof value === 'bigint') {
          return Number(value)
        }
        return value
      })
      return superjson.serialize(JSON.parse(json))
    },

    deserialize: superjson.deserialize
  }
}

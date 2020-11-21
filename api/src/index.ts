import * as express from 'express'
import * as winston from 'winston'
import * as morgan from 'morgan'

import { endpointNotFound } from './middleware/endpoint-not-found'
import router from './routes/router'

const app = express()

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   defaultMeta: { service: 'user-service' },
//   transports: [
//     new winston.transports.Console({
//       format: winston.format.simple()
//     })
//   ]
// })

// const log = console.log
// console.log = function (...args: any[]) {
//   logger.info(args.join(''))
//   log(...args)
// }

// app.use(morgan('combined', {
//   stream: {
//     write: function (message, ...args) {
//       logger.info(message)
//     }
//   }
// }))

app.use(morgan('combined'))

app.use(router)
app.use(endpointNotFound)

app.listen(3000, () => {
  console.log('API Listening on port 3000.')
})

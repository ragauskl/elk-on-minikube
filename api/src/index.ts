import * as express from 'express'
import { endpointNotFound } from './middleware/endpoint-not-found'
import router from './routes/router'
const app = express()

app.use(router)
app.use(endpointNotFound)

app.listen(3000, () => {
  console.log('API Listening on port 3000.')
})

import HttpError from '../util/http-error';
export function endpointNotFound(req, res, next) {
    const err = new HttpError('Not Found', 404);
    res.status(err.status).send(err.message);
}
//# sourceMappingURL=endpoint-not-found.js.map
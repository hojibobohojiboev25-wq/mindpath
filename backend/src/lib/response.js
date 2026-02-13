function ok(reply, data = {}, meta = {}) {
  return reply.send({
    success: true,
    data,
    error: null,
    meta
  });
}

function fail(reply, statusCode, code, message, details = null) {
  return reply.status(statusCode).send({
    success: false,
    data: null,
    error: { code, message, details },
    meta: {}
  });
}

module.exports = { ok, fail };

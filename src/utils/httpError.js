export function getErrorMessage(err) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Something went wrong'

  return typeof msg === 'string' ? msg : 'Something went wrong'
}

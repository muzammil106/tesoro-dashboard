export function getItems(data) {
  const items =
    data?.items ??
    data?.data ??
    data?.results ??
    data?.treasures ??
    data?.categories ??
    data?.contents ??
    data?.users ??
    data?.transactions ??
    []

  return Array.isArray(items) ? items : []
}

export function getTotal(data) {
  const total = data?.total ?? data?.meta?.total ?? data?.pagination?.total ?? 0
  return Number.isFinite(total) ? total : 0
}

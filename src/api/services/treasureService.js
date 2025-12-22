import { http } from '../http'
import { endpoints } from '../endpoints'

// Postman example:
// /api/treasures/all?page=1&limit=15&searchBy=...&category=...&condition=...&scope=all
export async function getTreasureList({
  page,
  pageSize,
  scope = 'all',
  searchBy,
  category,
  condition,
} = {}) {
  const res = await http.post(
    endpoints.treasures.all,
    {},
    {
      params: {
        page,
        limit: pageSize,
        scope,
        searchBy,
        category,
        condition,
      },
    },
  )
  return res.data
}

export async function getTreasureDetail(id) {
  const res = await http.post(endpoints.treasures.detail, {
    treasureId: id,
  })
  return res.data
}

export async function createTreasure(payload) {
  const res = await http.post(endpoints.treasures.create, payload)
  return res.data
}

export async function updateTreasure(id, payload) {
  const res = await http.post(endpoints.treasures.update, {
    treasureId: id,
    ...payload,
  })
  return res.data
}

export async function deleteTreasure(id) {
  const res = await http.post(endpoints.treasures.delete, {
    treasureId: id,
  })
  return res.data
}

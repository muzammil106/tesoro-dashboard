import { http } from '../http'
import { endpoints } from '../endpoints'

// Postman: POST /tips/all?page=1&limit=15
export async function getTipList({ page, pageSize } = {}) {
  const res = await http.post(
    endpoints.tips.all,
    {},
    {
      params: {
        page,
        limit: pageSize,
      },
    },
  )
  return res.data
}

import { http } from '../http'
import { endpoints } from '../endpoints'

export async function getContentList({ page = 1, pageSize = 15 } = {}) {
  const res = await http.post(
    endpoints.contents.all,
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

export async function getContentDetail(contentId) {
  const res = await http.post(endpoints.contents.detail, { contentId })
  return res.data
}

export async function createContent(payload) {
  const res = await http.post(endpoints.contents.create, payload)
  return res.data
}

export async function updateContent(contentId, payload) {
  const res = await http.post(endpoints.contents.update, { contentId, ...payload })
  return res.data
}

export async function deleteContent(contentId) {
  const res = await http.post(endpoints.contents.delete, { contentId })
  return res.data
}

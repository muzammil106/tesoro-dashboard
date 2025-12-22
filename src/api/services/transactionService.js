import { http } from '../http'
import { endpoints } from '../endpoints'

export async function getTransactionList({ page, pageSize, from, to }) {
  const res = await http.get(endpoints.transactions.list, {
    params: { page, limit: pageSize, from, to },
  })
  return res.data
}

export async function getRevenueSummary({ from, to }) {
  const res = await http.get(endpoints.transactions.revenueSummary, {
    params: { from, to },
  })
  return res.data
}

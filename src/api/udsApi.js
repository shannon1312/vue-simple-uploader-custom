import request from '@/utils/request'
/* 站点 */
export function merge(data) {
  return request({
    url: '/v1/merge',
    method: 'post',
    params: data,
    baseURL: `http://${sessionStorage.getItem('udsIpAddr')}`
  })
}

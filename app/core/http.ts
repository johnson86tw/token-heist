import { getApiUrl } from '~/config'
import type { FetchOptions } from 'ofetch'

export function useHttp() {
	const httpGet = $fetch.create({
		baseURL: getApiUrl(),
		retry: 1,
		onResponseError,
		onRequestError,
	})

	const httpPost = $fetch.create({
		method: 'post',
		baseURL: getApiUrl(),
		retry: 1,
		onResponseError,
		onRequestError,
	})

	return {
		httpGet,
		httpPost,
	}
}

/**
 * Context:
 *  client 沒有網路的時候
 *  user aborts a request
 *  api url 連線不到的時候
 *  cors 的時候
 */
const onRequestError: FetchOptions['onRequestError'] = ({ request, error, options }) => {
	console.error('request: ', request, error, options)
	throw new Error(`${request} ${error.message}`)
}

const onResponseError: FetchOptions['onResponseError'] = ({ response }) => {
	console.error('response: ', response)

	// http error data
	if (response._data) {
		throw new Error(response._data)
	}

	throw new Error(`${response.status} ${response.statusText}\n${response.url}`)
}

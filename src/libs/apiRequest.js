import {getBaseUrl} from 'src/config/requestConfig'
import HttpRequest from 'src/libs/httpRequest'

const baseUrl = getBaseUrl()
const request = new HttpRequest(baseUrl)
export default request

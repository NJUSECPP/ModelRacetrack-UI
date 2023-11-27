import axios from 'axios'
import {showWarn} from 'src/libs/message'
import {requestEventSourceJSON} from "src/libs/enventSource";

// 5分钟
axios.defaults.timeout = 300000

axios.interceptors.request.use(
  config => {
    return config
  },
  err => {
    if(err && err.message){
      return Promise.reject(new Error(err.message));
    }else {
      return Promise.reject(new Error("系统异常"));
    }
  }
)

axios.interceptors.response.use(res => {
  if (res.config && res.config.responseType === 'blob') {
    return res
  }
  return res.data;
}, error => {
  if(error && error.response &&error.response.status){
    if(error.response.status >= 500) {
      if(error.response.data && error.response.data.message){
        return Promise.reject(new Error("服务端异常："+error.response.data.message));
      }else {
        return Promise.reject(new Error("服务端异常"));
      }
    }else if(error.response.status >= 400){
      if(error.response.data && error.response.data.message){
        return Promise.reject(new Error("请求异常："+error.response.data.message));
      }else {
        return Promise.reject(new Error("请求异常"));
      }
    }else {
      if(error && error.message){
        return Promise.reject(new Error(error.message));
      }else {
        return Promise.reject(new Error("系统异常"));
      }
    }
  }else {
    if(error && error.message){
      return Promise.reject(new Error(error.message));
    }else {
      return Promise.reject(new Error("系统异常"));
    }
  }

})

const getHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
}

class HttpRequest {
  constructor (baseUrl) {
    this.baseUrl = baseUrl
  }

  getRequest = (api, params) => {
    return axios({
      method: 'get',
      url: `${this.baseUrl}${api}`,
      params: params,
      headers: getHeaders()
    })
  };

  postRequest = (api, params) => {
    return axios({
      method: 'post',
      url: `${this.baseUrl}${api}`,
      data: params,
      headers: getHeaders()
    })
  };

  eventSourceRequest = (api, params, onMessage) => {
    return new Promise((resolve, reject) => {
      requestEventSourceJSON(this.baseUrl + api, params, onMessage).then(() => {
        resolve();
      }).catch(err => {
        reject(err)
      })
    });
  };
}

export default HttpRequest

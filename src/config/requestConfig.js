export const getBaseUrl = () => {
  const local = localStorage.getItem("baseUrl");
  if(local && local.length > 0){
    return local;
  }
  return 'http://172.29.4.19:5111'
}

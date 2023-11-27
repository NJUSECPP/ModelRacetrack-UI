export const getBaseUrl = () => {
  const local = localStorage.getItem("baseUrl");
  if(local && local.length > 0){
    return local;
  }
  return 'http://127.0.0.1:5111'
}

export const getBaseUrl = () => {
  const local = localStorage.getItem("baseUrl");
  if(local && local.length > 0){
    return local;
  }
  return 'https://mock.apifox.com/m1/3527441-0-default'
}

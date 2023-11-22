
const state = () => ({
  all: [
    {
      id: 1,
      name: "StarCoder"
    }
  ]
})

const getters = {
  getAllModels: (state) => (keyword, pageNo, pageSize) => {
    return new Promise(resolve => {
      const models = state.all.filter(model => model.name.search(keyword) !== -1)
      let startIndex = (pageNo - 1) * pageSize;
      let endIndex = startIndex + pageSize;
      if(startIndex < 0 || startIndex >= models.length || endIndex <= startIndex){
        return resolve({
          models: [],
          total: models.length
        })
      }
      if(endIndex > models.length){
        endIndex = models.length;
      }
      const result = models.slice(startIndex, endIndex);
      return resolve({
        models: result,
        total: models.length
      })
    })
  }
}

const actions = {}

const mutations = {}



export default {
  namespaced: false,
  state,
  getters,
  actions,
  mutations
}

import request from "src/libs/apiRequest";

export const getAllModels = (keyword, pageNo, pageSize) => {
  return request.getRequest("/model/getAll", {keyword, pageSize, pageNo});
};

export const updateModelById = (model) => {
  return request.postRequest("/model/update", model)
}

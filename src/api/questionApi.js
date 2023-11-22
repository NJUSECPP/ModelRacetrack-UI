import request from "src/libs/apiRequest";

export const getAllQuestions = (keyword, pageNo, pageSize) => {
  return request.getRequest("/question/getAll", {keyword, pageSize, pageNo});
};

export const getAllTestcasesByQuestionId = (questionId, pageNo, pageSize) => {
  return request.getRequest('/question/testcase/getAll', {questionId, pageNo, pageSize});
}

export const insertQuestion = (question) => {
  return request.postRequest('/question/insert', question);
}

export const updateQuestionById = (question) => {
  return request.postRequest('/question/update', question);
}

export const deleteQuestionById = (questionId) => {
  return request.postRequest('/question/delete', {questionId});
}

export const batchInsertTestcases = (questionId, testcases) => {
  return request.postRequest('/question/testcase/batchInsert', {questionId, testcases});
}

export const batchDeleteTestcases = (testcaseIds) => {
  return request.postRequest('/question/testcase/batchDelete', {testcaseIds});
}





import request from "src/libs/apiRequest";

export const runWithOJ = (modelId, questionId, onMessage) => {
  return request.eventSourceRequest("/run/runWithOJ", {modelId, questionId}, onMessage);
};

import request from "src/libs/apiRequest";
import { v4 as uuidV4 } from 'uuid'

export const runWithOJ = (modelName, questionId, onMessage) => {
  const sessionId = uuidV4();
  return request.eventSourceRequest("/run/runWithOJ", {
      modelName: modelName,
      questionId: questionId,
      userId: 0,
      userName:"modelRacetrack",
      sessionId:sessionId
    }
    , onMessage);
};


function concat(a, b) {
  const res = new Uint8Array(a.length + b.length);
  res.set(a);
  res.set(b, a.length);
  return res;
}

function newMessage() {
  return {
    data: '',
    event: '',
    id: '',
    retry: undefined,
  };
}
async function getBytes(stream, onChunk) {
  const reader = stream.getReader();
  let result;
  while (!(result = await reader.read()).done) {
    onChunk(result.value);
  }
}

function getLines(onLine) {
  let buffer;
  let position;
  let fieldLength;
  let discardTrailingNewline = false;
  return function onChunk(arr) {
    if (buffer === undefined) {
      buffer = arr;
      position = 0;
      fieldLength = -1;
    }
    else {
      buffer = concat(buffer, arr);
    }
    const bufLength = buffer.length;
    let lineStart = 0;
    while (position < bufLength) {
      if (discardTrailingNewline) {
        if (buffer[position] === 10) {
          lineStart = ++position;
        }
        discardTrailingNewline = false;
      }
      let lineEnd = -1;
      for (; position < bufLength && lineEnd === -1; ++position) {
        switch (buffer[position]) {
          case 58:
            if (fieldLength === -1) {
              fieldLength = position - lineStart;
            }
            break;
          case 13:
            discardTrailingNewline = true;
          case 10:
            lineEnd = position;
            let success = onLine(buffer.subarray(lineStart, lineEnd), fieldLength);
            if(!success){
              lineEnd = -1;
            }else {
              break;
            }
        }
      }
      if (lineEnd === -1) {
        break;
      }
      lineStart = position;
      fieldLength = -1;
    }
    if (lineStart === bufLength) {
      buffer = undefined;
    }
    else if (lineStart !== 0) {
      buffer = buffer.subarray(lineStart);
      position -= lineStart;
    }
  };
}

function getMessages(onMessage) {
  const decoder = new TextDecoder();
  return function onLine(line, fieldLength) {
    if (line.length === 0) {
      return true;
    }
    if (fieldLength < 0) {
      return false;
    }
    const field = decoder.decode(line.subarray(0, fieldLength));
    if(field !== 'data'){
      return true;
    }
    const valueOffset = fieldLength + (line[fieldLength + 1] === 32 ? 2 : 1);
    let obj = {};
    try {
      let value = decoder.decode(line.subarray(valueOffset))
      value = value.replace(/\r/g,"\\r")
        .replace(/\n/g,"\\n")
      obj = JSON.parse(value);
    }catch (error) {
      return false;
    }

    onMessage === null || onMessage === void 0 ? void 0 : onMessage(obj);
    return true;
  };
}

async function request(api, params, onMessage, controller) {
  const response = await fetch(api, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params),
    signal: controller.signal
  }).catch(() => {
    return null;
  })
  if (!response || response.status !== 200) {
    if (response && response.status >= 500) {
      if (response && response.statusText) {
        return Promise.reject(new Error("服务端异常：" + response.statusText));
      } else {
        return Promise.reject(new Error("服务端异常"));
      }
    } else if (response && response.status >= 400) {
      if (response && response.statusText) {
        return Promise.reject(new Error("请求异常：" + response.statusText));
      } else {
        return Promise.reject(new Error("请求异常"));
      }
    } else if (response && response.statusText) {
      return Promise.reject(new Error("系统异常：") + response.statusText);
    } else {
      return Promise.reject(new Error("系统异常"));
    }
  }

  await getBytes(response.body, getLines(getMessages(onMessage)));
  return Promise.resolve();
}

export const requestEventSourceJSON = (api, params, onMessage) => {
  let controller = new AbortController();
  let timeoutPromise = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        controller.abort(new Error("请求超时"));
      }, 3 * 3 * 60 * 1000);
    });
  }
  return Promise.race([timeoutPromise(), request(api, params, onMessage, controller)]);
}




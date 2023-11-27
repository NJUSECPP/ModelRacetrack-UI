import Papa from 'papaparse';
import jschardet from 'jschardet'

export const parseCSV = (fileName, onStep, onComplete) => {
  let reader = new FileReader();
  reader.readAsDataURL(fileName)
  reader.onload = evt => {
    let encoding = checkEncoding(evt.target.result);
    Papa.parse(fileName, {
      encoding: encoding,
      header: true,
      // skipEmptyLines: 'greedy',
      step: (result, parser) => {
        onStep(result)
      },
      complete: () => {
        onComplete();
      }
    });
  }
}

function checkEncoding(base64Str) {
  let str = atob(base64Str.split(';base64,')[1])
  let encoding = jschardet.detect(str)
  encoding = encoding.encoding
  if (encoding === 'windows-1252') {
    encoding = 'ANSI'
  }
  return encoding
}

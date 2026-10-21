const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\anush\\.gemini\\antigravity\\brain\\53fdd9ec-bb47-4b7c-aa4c-4e66bc33b8be\\.system_generated\\logs\\transcript.jsonl';

async function recover() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let fileLines = new Map();
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const call of obj.tool_calls) {
           if (call.name === 'view_file' && call.args && call.args.AbsolutePath && call.args.AbsolutePath.includes('index.tsx')) {
               // wait we don't have the output here, the output is in the next step
           }
        }
      }
      if (obj.type === 'TOOL_RESPONSE' && obj.content && obj.content.includes('index.tsx')) {
         const lines = obj.content.split('\n');
         let capturing = false;
         for (const l of lines) {
            if (l.match(/^\d+:/)) {
               const num = parseInt(l.split(':')[0], 10);
               const content = l.substring(l.indexOf(':') + 2);
               fileLines.set(num, content);
            }
         }
      }
    } catch (e) {
      // ignore parse error
    }
  }

  const sortedKeys = Array.from(fileLines.keys()).sort((a, b) => a - b);
  const recoveredLines = [];
  for (let i = 1; i <= sortedKeys[sortedKeys.length - 1]; i++) {
     recoveredLines.push(fileLines.get(i) !== undefined ? fileLines.get(i) : `// MISSING LINE ${i}`);
  }

  fs.writeFileSync('app/index.tsx_recovered', recoveredLines.join('\n'));
  console.log('Recovery complete!');
}

recover();

const fs = require('fs');
const path = require('path');

const DATA_PATH = (() => {
  const explicitPath = process.env.DATA_FILE_PATH;
  if (explicitPath) {
    const absolute = path.isAbsolute(explicitPath)
      ? explicitPath
      : path.join(process.cwd(), explicitPath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    return absolute;
  }
  const defaultPath = path.join(__dirname, 'dead-drop-data.json');
  fs.mkdirSync(path.dirname(defaultPath), { recursive: true });
  return defaultPath;
})();

const defaultData = {
  users: [],
  vaults: [],
  executors: [],
  sessions: [],
  triggers: [],
  memorials: [],
  invoices: [],
  subscriptionEvents: []
};

function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(defaultData, null, 2));
    return { ...defaultData };
  }

  const content = fs.readFileSync(DATA_PATH, 'utf8');
  try {
    const parsed = JSON.parse(content);
    return { ...defaultData, ...parsed };
  } catch (error) {
    console.error('Failed to parse data file, resetting to default state.', error);
    fs.writeFileSync(DATA_PATH, JSON.stringify(defaultData, null, 2));
    return { ...defaultData };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function updateData(mutator) {
  const data = readData();
  const result = mutator(data);
  writeData(data);
  return result;
}

module.exports = {
  readData,
  writeData,
  updateData,
  defaultData
};

const fs = require('fs').promises;
const path = require('path');

const INDEX_FILE = path.join(__dirname, '../../data/index.txt');

async function readNoteData() {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf8');
    return data.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [date, title, uploadDate] = line.split('|');
        return { date, title, uploadDate };
      });
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(INDEX_FILE, '', 'utf8');
      return [];
    }
    throw error;
  }
}

async function saveNoteData(notes) {
  const content = notes
    .map(note => `${note.date}|${note.title}|${note.uploadDate}`)
    .join('\n');
  await fs.writeFile(INDEX_FILE, content + '\n', 'utf8');
}

module.exports = {
  readNoteData,
  saveNoteData
};
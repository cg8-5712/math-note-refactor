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
  try {
    // 创建临时文件
    const tempPath = INDEX_FILE + '.tmp';
    const content = notes
      .map(note => `${note.date}|${note.title}|${note.uploadDate}`)
      .join('\n');
    
    await fs.writeFile(tempPath, content + '\n', 'utf8');
    await fs.rename(tempPath, INDEX_FILE);
  } catch (error) {
    throw new Error(`Failed to save notes: ${error.message}`);
  }
}

module.exports = {
  readNoteData,
  saveNoteData
};
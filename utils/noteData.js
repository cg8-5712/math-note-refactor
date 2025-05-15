const fs = require('fs').promises;
const path = require('path');

async function readNoteData() {
    try {
        const data = await fs.readFile('data/index.txt', 'utf8');
        return data.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [date, title, uploadDate] = line.split('|');
                return { date, title, uploadDate };
            });
    } catch (error) {
        console.error('Failed to read note data:', error);
        return [];
    }
}

async function saveNoteData(notes) {
    const content = notes
        .map(note => `${note.date}|${note.title}|${note.uploadDate}`)
        .join('\n');
    await fs.writeFile('data/index.txt', content);
};

module.exports = {
    readNoteData,
    saveNoteData
};
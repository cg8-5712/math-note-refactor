const fs = require('fs').promises;
const path = require('path');

async function readNoteData() {
    try {
        const data = await fs.readFile('data/index.txt', 'utf8');
        return data.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [date, title, uploadDate] = line.split('|');
                // Extract month and day for display
                const displayDate = date.split('.').slice(1).join('.');
                return { 
                    date,           // full date (YYYY.MM.DD)
                    displayDate,    // MM.DD
                    title, 
                    uploadDate 
                };
            });
    } catch (error) {
        console.error('Failed to read note data:', error);
        return [];
    };
};

async function saveNoteData(notes) {
    const content = notes
        .map(note => `${note.date}|${note.title}|${note.uploadDate}`)
        .join('\n');
    await fs.writeFile('data/index.txt', content + '\n');
};

module.exports = {
    readNoteData,
    saveNoteData
};
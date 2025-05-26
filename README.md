<h1 align="center">
  📚 Math Notes Management System
</h1>

<p align="center">
  A sleek and intuitive web application for managing and displaying mathematics classroom whiteboard photos. 
</p>

<p align="center">
  <a href="https://www.codefactor.io/repository/github/cg8-5712/math-note-refactor/">
    <img src="https://www.codefactor.io/repository/github/cg8-5712/math-note-refactor/badge" alt="CodeFactor" />
  </a>

  <a href="https://github.com/Bj35-Dev/math_note/activity">
    <img src="https://img.shields.io/github/last-commit/Bj35-Dev/math_note/main" alt="Last Commit"/>
  </a>

  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/Bj35-Dev/math_note" alt="GPL-3.0\"/>
  </a>
</p>

## ✨ Features

- 📸 Store and organize whiteboard photos by date
- 🖼️ Beautiful gallery view with fullscreen preview
- 🎯 Drag-and-drop image reordering
- 📱 Mobile-friendly responsive design
- 🔒 Secure admin interface
- 🎨 Clean and modern UI

## 🚀 Getting Started

### Prerequisites

- Node.js (v22 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Bj35-Dev/math_note.git
cd math_note
```

2. Install dependencies:
```bash
npm install
```

3. Rename index.txt
``` bash
cd data
mv index.txt.example index.txt
```

4. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:1064`

For development, you can use:
```bash
npm run dev
```
This will start the server with hot-reloading enabled.

## 🏗️ Project Structure

```
math_note/
├── app.js                # Application entry point
├── bin/                  # Server startup scripts
├── config/               # Configuration files
├── data/                 # Data storage
│   └── index.txt.exampl  # Example file of index.txt
├── middleware/           # Express middleware
├── public/               # Static files
│   ├── images/           # Uploaded images
│   ├── javascripts/      # Client-side JS
│   └── stylesheets/      # CSS files
├── routes/               # Route handlers
├── utils/                # Utility functions
└── views/                # Pug templates
```

## 💡 Usage

### Student View
- Browse notes by date
- View images in fullscreen mode
- Navigate through chronological entries

### Admin Panel
- Add new notes with date and title
- Upload and manage whiteboard photos
- Reorder images via drag-and-drop
- Edit note titles
- Delete notes and images

## 🛠️ Technologies Used

- Express.js - Web framework
- Pug - Template engine
- Express Session - Authentication
- SortableJS - Drag-and-drop functionality
- Modern CSS - Responsive design

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Built for making mathematics education more accessible
- Inspired by the need for better classroom note organization
- Thanks to all contributors and users

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---
Made with ❤️ for mathematics education

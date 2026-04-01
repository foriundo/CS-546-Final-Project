# NYC Public Computer Access Finder

A web application to help NYC residents find public computer centers across the city. Built with Node.js, Express, Handlebars, and MongoDB.

## Team
- Joey Nadeau
- Fernando Oriundo
- Shane Malinak
- Mohammed Khudhur

---

## Getting Started

### Prerequisites
Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Community Edition](https://www.mongodb.com/docs/manual/installation/)

#### Installing MongoDB on Mac
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Installing MongoDB on Windows
1. Download the MongoDB Community Server installer from https://www.mongodb.com/try/download/community
2. Run the `.msi` installer — use all default settings and check "Install MongoDB as a Service"
3. MongoDB will start automatically as a Windows service after install

To verify it's running, open Services (search "Services" in the Start menu) and confirm "MongoDB" shows as Running. Alternatively run this in PowerShell:
```bash
Get-Service -Name MongoDB
```

### 1. Clone the repo
```bash
git clone https://github.com/foriundo/CS-546-Final-Project.git
cd CS-546-Final-Project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Seed the database
This pulls 450 records directly from the NYC Open Data API and loads them into MongoDB.
```bash
npm run seed
```

### 4. Start the server
```bash
npm start
```

The app will be running at **http://localhost:3000**

---

## Project Structure
```
/config         MongoDB connection and collection setup
  mongoConnection.js    Handles DB connection (singleton pattern)
  mongoCollections.js   Exports centers and users collections
  settings.js           Database name and server URL

/data           Data layer functions (getAllCenters, getCenterById, etc.)
/routes         Express route handlers
/views          Handlebars templates
  /layouts      Main page layout
  /partials     Reusable header and footer
  /centers      Listing and detail page views
/public         Static assets
  /css          main.css (15+ custom rulesets)
  /js           main.js (client-side JavaScript)
/tasks          
  seed.js       Fetches data from NYC Open Data and seeds MongoDB

app.js          Express app entry point
package.json    Dependencies and npm scripts
```

---

## npm Scripts
| Command | Description |
|---|---|
| `npm start` | Starts the server at localhost:3000 |
| `npm run seed` | Seeds the database from NYC Open Data API |

---

## Dataset
Data comes from the [NYC Open Data Citywide Public Computer Centers](https://data.cityofnewyork.us/Social-Services/Citywide-Public-Computer-Centers/sejx-2gn3/about_data) dataset.

---

## Notes for the Team
- Never commit `node_modules/` — it's in `.gitignore`
- Never commit `.env` files — keep secrets local
- Always run `npm run seed` after cloning to populate your local database
- MongoDB must be running locally before starting the app or seeding

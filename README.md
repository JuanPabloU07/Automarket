# AutoMarket — Car Buy & Sell

A web application to manage a dealership's inventory. You can register vehicles, import them from a CSV file, and view the history of every action performed within the system.

## 📋 Prerequisites

What do you need to install?

* **Node.js** — to run the server.
* **MySQL** — to store vehicle data.
* **MongoDB** — for the activity history (optional).

## ⚙️ Initial Configuration

### 1. Create MySQL Tables
Open your terminal and execute:

```bash
mysql -u root -p < script.sql
2. Environment Variables
Create a .env file in the project's root folder:

Fragmento de código
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourPassword
DB_NAME=automarket
PORT=3000
3. Install Dependencies
Run the following command:

Bash
npm install
🚀 How to Run
Execute the following command in your terminal:

Bash
nodemon index.js
Then, open your browser at:
http://localhost:3000

🛠️ Features
Inventory — View all registered vehicles, including seller info, prices, and automatically calculated profit.

Add — Register a new vehicle with license plate, brand, color, status, and mileage.

Import CSV — Upload up to 80 vehicles at once by dragging and dropping a .csv file.

History — Consult every action performed: what was created, edited, deleted, or imported, and when.

📂 Project Structure
Plaintext
car buy and sell/
├── index.js          ← Starts the server
├── .env              ← Credentials (do not upload to GitHub)
├── script.sql        ← Creates MySQL tables
├── config/           ← MySQL and MongoDB connections
├── routes/           ← API routes
├── controllers/      ← Logic for each operation
├── middlewares/      ← CSV file uploading
├── models/           ← History structure
└── public/           ← Web interface (HTML, CSS, JS)
# AutoMarket — Hybrid Backend Architecture (MySQL + MongoDB + Node/Express)

Juan Pablo Urrego
Clan: Thompson
[juanpablou07@gmail.com]()
ID: 1152443924

---

# 1. Overview

**AutoMarketPro** is a backend system designed to manage a vehicle dealership.
The system allows the company to:

* Register vehicles in inventory
* Manage vehicle sales
* Import large datasets from CSV files
* Track vehicle operation history
* Maintain relational integrity using SQL
* Store operational history using NoSQL

The architecture implements a **hybrid database model** combining:

* **MySQL** for structured relational data
* **MongoDB Atlas** for event history and traceability
* **Node.js + Express** for the REST API

This approach demonstrates:

* Database normalization up to **Third Normal Form (3NF)**
* Referential integrity
* Strategic separation of SQL and NoSQL responsibilities
* CSV data ingestion
* Hybrid persistence architecture

---

# 2. Technology Stack

Backend technologies used:

* **Node.js v20 (ES Modules)**
* **Express**
* **MySQL**
* **MongoDB Atlas**
* **Mongoose**

Dependencies:

* express
* mysql2
* mongoose
* multer
* csv-parser
* dotenv

---

# 3. Project Structure

automarket/

config/
mysql.js
mongo.js

controllers/
history.controller
vehicule.controller

models/
log

route/
history.routes
vehicule.routes

public/
app.js
index.html
styles.css

public/
css/
styles.css
js/
app.js

middlewares/
vehiculos.csv
Diagrama 
uploads


index.js
README.md

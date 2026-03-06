CREATE DATABASE IF NOT EXISTS automarket;
USE automarket;

CREATE TABLE IF NOT EXISTS persons (
  id_Persons INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  CONSTRAINT uq_phone UNIQUE (phone)
);

CREATE TABLE IF NOT EXISTS vehicles (
  id_Vehicles INT AUTO_INCREMENT PRIMARY KEY,
  plate VARCHAR(10) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  color VARCHAR(30),
  vehicle_status ENUM('New','Used') DEFAULT 'Used',
  mileage INT DEFAULT 0,
  CONSTRAINT uq_plate UNIQUE (plate)
);

CREATE TABLE IF NOT EXISTS purchases (
  id_Purchase INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  seller_id INT NOT NULL,
  purchase_price DECIMAL(12,2) NOT NULL,
  entry_date DATE NOT NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id_Vehicles) ON DELETE RESTRICT,
  FOREIGN KEY (seller_id) REFERENCES persons(id_Persons) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sales (
  id_Sales INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  buyer_id INT NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  sale_date DATE NOT NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id_Vehicles) ON DELETE RESTRICT,
  FOREIGN KEY (buyer_id) REFERENCES persons(id_Persons) ON DELETE RESTRICT,
  CONSTRAINT uq_vehicle_sale UNIQUE (vehicle_id)
);
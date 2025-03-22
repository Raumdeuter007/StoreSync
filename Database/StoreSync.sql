USE master;
GO

-- Drop the database if it already exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'InventoryManagementSystem')
BEGIN
    ALTER DATABASE InventoryManagementSystem SET SINGLE_USER WITH ROLLBACK IMMEDIATE; 
    DROP DATABASE InventoryManagementSystem;
END
GO

-- Create a fresh database
CREATE DATABASE InventoryManagementSystem;
GO

-- Use the new database
USE InventoryManagementSystem;
GO

/*User Accounts and Access */

CREATE TABLE Owners(
	ownerID INT IDENTITY(1,1),
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(255) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL
);

ALTER TABLE Owners ADD CONSTRAINT PK_Owners PRIMARY KEY (ownerID);

/* Manager Table */
CREATE TABLE Managers(
	managerID INT IDENTITY(1,1),
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(255) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL,
	businessID INT NOT NULL,
	assignedStore INT DEFAULT(NULL)
);
ALTER TABLE Managers ADD CONSTRAINT PK_Man PRIMARY KEY(managerID);

-- create unique index manually to only treat non-nulls as duplicates and allow multiple nulls
CREATE UNIQUE NONCLUSTERED INDEX idx_unique_assignedStore
ON Managers(assignedStore)
WHERE assignedStore IS NOT NULL;

/*Business Management for Owners  */

/*Business*/
CREATE TABLE Business(
	BusinessID INT IDENTITY(1,1),
	BusinessName VARCHAR(255) NOT NULL,
	HQAddress VARCHAR(255) NOT NULL,
	OwnerID INT UNIQUE NOT NULL
);
ALTER TABLE Business ADD CONSTRAINT PK_Business PRIMARY KEY (BusinessID);

/* Store & Warehouse Information */
CREATE TABLE Stores(
	StoreID INT IDENTITY(1,1),
	StoreName VARCHAR(255) NOT NULL,
	BusinessID INT NOT NULL,
	StoreAddress VARCHAR(255) NOT NULL UNIQUE,
	ManagerID INT UNIQUE 	
);
ALTER TABLE Stores ADD CONSTRAINT PK_Stores PRIMARY KEY (StoreID);

/* Inventory Management */

/* Product Details */
CREATE TABLE Products(
	ProductID INT IDENTITY(1,1),
	ProductName VARCHAR(255) NOT NULL,
	BusinessID INT NOT NULL,
	Category VARCHAR(255) NOT NULL,
	PricePerUnit DECIMAL(10,2) NOT NULL
);

ALTER TABLE Products ADD CONSTRAINT PK_Products PRIMARY KEY (ProductID);

CREATE TABLE Inventory(
	warehouseID INT NOT NULL,
	ProductID INT NOT NULL,
	stockQuantity INT NOT NULL DEFAULT(0)
);

ALTER TABLE Inventory ADD CONSTRAINT PK_Inventory PRIMARY KEY (warehouseID, ProductID);
 
/*Stock Movement & Requests */

CREATE TABLE RequestStatus(
	StatusID INT IDENTITY(1,1),
	StatusName VARCHAR(255) NOT NULL UNIQUE
);

ALTER TABLE RequestStatus ADD PRIMARY KEY (StatusID);
INSERT INTO RequestStatus VALUES
('Pending'), ('Approved'), ('Rejected'), ('In Progress'), ('Completed');

CREATE TABLE StockRequests(
	RequestingStoreID INT NOT NULL,
	ProductID INT NOT NULL,
	RequestedQuantity INT NOT NULL,
	ReqStatus INT DEFAULT 1,
	request_date DATETIME DEFAULT GETDATE() NOT NULL,
	approvedby INT DEFAULT NULL,
	fullfillmentdate DATETIME DEFAULT NULL
);

ALTER TABLE StockRequests ADD CONSTRAINT PK_StockRequests PRIMARY KEY (RequestingStoreID, ProductID, request_date);

/* Notifications & Alerts */

CREATE TABLE NotificationType(
	notificationID INT IDENTITY(1,1),
	nType VARCHAR(100) NOT NULL UNIQUE
);
ALTER TABLE NotificationType ADD PRIMARY KEY (notificationID);
INSERT INTO NotificationType VALUES
('Low Stock'), ('Restock Request'), ('System Alert');

CREATE TABLE read_status(
	StatusID INT IDENTITY(1,1),
	StatusName VARCHAR(100) NOT NULL UNIQUE
);

ALTER TABLE read_status ADD PRIMARY KEY (StatusID);
INSERT INTO read_status VALUES
('Unread'), ('Read');

CREATE TABLE Notifications(
	NotificationID INT IDENTITY(1,1),
	RecipientUserID INT NOT NULL,
	n_Type INT DEFAULT 1,
	Content VARCHAR(MAX) NOT NULL,
	created_at DATETIME DEFAULT GETDATE(),
	ReadStatus INT DEFAULT 1
);

ALTER TABLE Notifications ADD CONSTRAINT PK_Notifications PRIMARY KEY (NotificationID);

--Constraints added to 'Owners'
ALTER TABLE Owners ADD CONSTRAINT Ch_oemail CHECK (email LIKE '%@%');

--Constraints added to 'Managers'
ALTER TABLE Managers ADD CONSTRAINT FK_Users2 FOREIGN KEY (assignedstore) REFERENCES Stores(storeID) ON DELETE SET NULL;
ALTER TABLE Managers ADD CONSTRAINT FK_BusID FOREIGN KEY (businessID) REFERENCES Business(businessID);
ALTER TABLE Managers ADD CONSTRAINT Ch_memail CHECK (email LIKE '%@%');

--Constraints added to 'Business'
ALTER TABLE Business ADD CONSTRAINT FK_Business FOREIGN KEY (OwnerID) REFERENCES Owners(ownerID);

--Constraints added to 'Stores'
ALTER TABLE Stores ADD CONSTRAINT FK_Stores1 FOREIGN KEY (BusinessID) REFERENCES Business(BusinessID);
ALTER TABLE Stores ADD CONSTRAINT FK_Stores2 FOREIGN KEY (ManagerID) REFERENCES Managers(managerID) ON DELETE SET NULL;

--Constraints added to 'Products'
ALTER TABLE Products ADD CONSTRAINT FK_Products1 FOREIGN KEY (BusinessID) REFERENCES Business(BusinessID);
ALTER TABLE Products ADD CONSTRAINT Ch_price CHECK (priceperunit > 0);

--Constraints added to 'Inventory'
ALTER TABLE Inventory ADD CONSTRAINT FK_Inventory1 FOREIGN KEY (warehouseID) REFERENCES Stores(StoreID) ON DELETE CASCADE;
ALTER TABLE Inventory ADD CONSTRAINT FK_Inventory2 FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE;
ALTER TABLE Inventory ADD CONSTRAINT Ch_quantity CHECK (stockQuantity >= 0);

--Constraints added to 'StockRequests'
ALTER TABLE StockRequests ADD CONSTRAINT FK_StockRequests1 FOREIGN KEY (RequestingStoreID) REFERENCES Stores(StoreID) ON DELETE CASCADE;
ALTER TABLE StockRequests ADD CONSTRAINT FK_StockRequests2 FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE;
ALTER TABLE StockRequests ADD CONSTRAINT FK_StockRequests3 FOREIGN KEY (ReqStatus) REFERENCES RequestStatus(StatusID);
ALTER TABLE StockRequests ADD CONSTRAINT FK_StockRequests4 FOREIGN KEY (approvedby) REFERENCES Owners(ownerID);
ALTER TABLE StockRequests ADD CONSTRAINT Ch_Rquantity CHECK (RequestedQuantity > 0);

--Constraints added to 'Notifications'
ALTER TABLE Notifications ADD CONSTRAINT FK_Notifications1 FOREIGN KEY (RecipientUserID) REFERENCES Owners(ownerID);
ALTER TABLE Notifications ADD CONSTRAINT FK_Notifications2 FOREIGN KEY (n_Type) REFERENCES NotificationType(notificationID);
ALTER TABLE Notifications ADD CONSTRAINT FK_Notifications3 FOREIGN KEY (ReadStatus) REFERENCES read_status(StatusID);



--select ao.name,ao.type_desc,delete_referential_action_desc,*
--from sys.foreign_keys fk 
--inner join sys.all_objects ao 
--on fk.parent_object_id = ao.object_id

--SELECT *
--FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
--WHERE TABLE_NAME = 'Users'
--AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- User Accounts and Access
SELECT * FROM Owners;
SELECT * FROM Managers;

-- Business Management for Owners
SELECT * FROM Business;
SELECT * FROM Stores;

-- Inventory Management
SELECT * FROM Products;
SELECT * FROM Inventory;

-- Stock Movement & Requests
SELECT * FROM RequestStatus;
SELECT * FROM StockRequests;

-- Notifications & Alerts
SELECT * FROM NotificationType;
SELECT * FROM read_status;
SELECT * FROM Notifications;


-- SELECTION QUERIES
--  1. Verify Username and Password, return user details

--  2. Get Business details if Owner

--  3. Get stores/warehouses of the Business (for Owner)

--  4. Get store details for manager

--  5. Get Inventory Stock Details for Stores

--  6. Get All Stock Requests for a Store (may be from manager or owner)

--  7. Get Stock Requests that have not been resolved (pending), sort by request date.

--  8. Get Stock Requests for all stores (Owner)

--  9. Get Notifications for a certain store.

-- 10. Retrieve the current stock levels of all products in a specific warehouse.

-- 11. Get a list of all products that are below the reorder level (minimum 5) in a given warehouse.

-- 12. Retrieve the total stock of a particular product across all warehouses.

-- 13. Get the stock details of a specific product in a specific warehouse.

-- 15. Get the details of a specific stock request, including requested product, quantity, and status.

-- 16. Fetch all completed stock requests along with fulfillment dates for a given time period.

-- 17. Get the total number of stock requests made by a specific store in the last month.

-- 18. Retrieve the top 5 most requested products across all stores in the last 3 months.

-- 19. Get a summary of stock movements (incoming & outgoing) for a specific warehouse.

-- 20. Generate a report of all low-stock products grouped by warehouse for restocking decisions.

-- DELETION QUERIES
-- 


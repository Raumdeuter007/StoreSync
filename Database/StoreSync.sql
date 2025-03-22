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
	password VARCHAR(255) NOT NULL,
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
	assignedStore INT DEFAULT(NULL) --Removed UNIQUE as NULLS treated as duplicates in MSSQL
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
	HQAddress VARCHAR(255) NOT NULL,    -- Renamed 
	OwnerID INT UNIQUE NOT NULL
);
ALTER TABLE Business ADD CONSTRAINT PK_Business PRIMARY KEY (BusinessID);

 
/* Store & Warehouse Information */
CREATE TABLE Stores(
	StoreID INT IDENTITY(1,1),
	StoreName VARCHAR(255) NOT NULL,
	BusinessID INT NOT NULL,
	StoreAddress VARCHAR(255) NOT NULL UNIQUE,  -- Added UNIQUE constraint to prevent duplicate store addresses.
	ManagerID INT UNIQUE NOT NULL	
);
ALTER TABLE Stores ADD CONSTRAINT PK_Stores PRIMARY KEY (StoreID);


/* BInventory Management */

/* Product Details */
CREATE TABLE Products(
	ProductID INT IDENTITY(1,1),
	ProductName VARCHAR(255) NOT NULL,
	BusinessID INT NOT NULL,
	Category VARCHAR(255) NOT NULL,
	PricePerUnit DECIMAL(10,2) NOT NULL, -- DECIMAL(10,2) used --Precise fixed-point representation stores price to 2 decimal places with max 8 digits on the left of decimal point; has check of > 0
	-- warehouseLocation VARCHAR(255)
);


ALTER TABLE Products ADD CONSTRAINT PK_Products PRIMARY KEY (ProductID);


CREATE TABLE Inventory(
	warehouseID INT NOT NULL,
	ProductID INT NOT NULL,
	stockQuantity INT NOT NULL DEFAULT(0)
);

ALTER TABLE Inventory ADD CONSTRAINT PK_Inventory PRIMARY KEY (warehouseID, ProductID);
 
/*Stock Movement & Requests */


CREATE TABLE RequestStatus(                /*lookup TABLE for status */
	StatusID INT IDENTITY(1,1),
	StatusName VARCHAR(255) NOT NULL UNIQUE  -- -- ADDED: 1)NOT NULL Contraint; 2)UNIQUE Contraint;
	 
);

ALTER TABLE RequestStatus ADD PRIMARY KEY (StatusID);
INSERT INTO RequestStatus VALUES
('Pending'), ('Approved'), ('Rejected'), ('In Progress'), ('Completed');

select * from RequestStatus;


CREATE TABLE StockRequests(
	RequestingStoreID INT NOT NULL,
	ProductID INT NOT NULL,
	RequestedQuantity INT NOT NULL,   --  constraint of >0 enforced --> atleast 1 unit of some product should be requested
	ReqStatus INT DEFAULT 1,
	request_date DATETIME DEFAULT GETDATE() NOT NULL,
	approvedby INT DEFAULT NULL,
	fullfillmentdate DATETIME DEFAULT NULL
);

--No store can make multiple requests for the same product at the exact same timestamp.
--Prevents duplicate stock requests accidentally being inserted --> double entry prevented on accidentally placing multiple requests.
ALTER TABLE StockRequests ADD CONSTRAINT PK_StockRequests PRIMARY KEY (RequestingStoreID, ProductID, request_date);   

/* Notifications & Alerts */

CREATE TABLE NotificationType(                /*lookup table for NotificationType */
	notificationID INT IDENTITY(1,1),
	nType VARCHAR(100)	NOT NULL UNIQUE		-- ADDED: 1)NOT NULL Contraint; 2)UNIQUE Contraint;
	
);
ALTER TABLE NotificationType ADD PRIMARY KEY (notificationID);
INSERT INTO NotificationType VALUES
('Low Stock'),  ('Restock Request'), ('System Alert');


CREATE TABLE read_status(                /*lookup TABLE for read_status */
	StatusID INT IDENTITY(1,1),
	StatusName VARCHAR(100)	  NOT NULL UNIQUE	-- ADDED: 1)NOT NULL Contraint; 2)UNIQUE Contraint;

);

ALTER TABLE read_status ADD PRIMARY KEY (StatusID);
INSERT INTO read_status VALUES
('Unread'), ('Read');

CREATE TABLE Notifications(
	NotificationID INT IDENTITY(1,1),
	RecipientUserID INT NOT NULL,
	n_Type INT DEFAULT 1,
	Content VARCHAR(MAX) NOT NULL,              -- changed to VARCHAR(MAX) --> TEXT datatype is deprecated SQL Server 2005 onwards.
	created_at DATETIME DEFAULT GETDATE(),
	ReadStatus INT DEFAULT 1
);

ALTER TABLE Notifications ADD CONSTRAINT PK_Notifications PRIMARY KEY (NotificationID);


-- Alter table command Remains here to avoid Foriegn key dependency issues(Referenced table non-existent at the time of adding FK constraints)

-- TODO:Combine Constraints in One ALTER TABLE Per Table

--Constraints added to 'Owners'
ALTER TABLE Owners ADD CONSTRAINT Ch_oemail CHECK (email LIKE '%@%');

--Constraints added to 'Managers'
ALTER TABLE Managers ADD CONSTRAINT FK_Users2 FOREIGN KEY (assignedstore) REFERENCES Stores(storeID);
ALTER TABLE Managers ADD CONSTRAINT FK_BusID FOREIGN KEY (businessID) REFERENCES Business(businessID);
ALTER TABLE Managers ADD CONSTRAINT Ch_memail CHECK (email LIKE '%@%');

--Constraints added to 'Business'
ALTER TABLE Business ADD CONSTRAINT FK_Business FOREIGN KEY (OwnerID) REFERENCES Owners(ownerID);

--Constraints added to 'Stores'
ALTER TABLE Stores ADD CONSTRAINT FK_Stores1 FOREIGN KEY (BusinessID) REFERENCES Business(BusinessID);
ALTER TABLE Stores ADD CONSTRAINT FK_Stores2 FOREIGN KEY (ManagerID) REFERENCES Managers(managerID);

--Constraints added to 'Products'
ALTER TABLE Products ADD CONSTRAINT FK_Products1 FOREIGN KEY (BusinessID) REFERENCES Business(BusinessID);
ALTER TABLE Products ADD CONSTRAINT Ch_price CHECK (priceperunit > 0);

--Constraints added to 'Inventory'
ALTER TABLE Inventory ADD CONSTRAINT FK_Inventory1 FOREIGN KEY (warehouseID) REFERENCES Stores(StoreID);
ALTER TABLE Inventory ADD CONSTRAINT FK_Inventory2 FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE;
ALTER TABLE Inventory ADD CONSTRAINT Ch_quantity CHECK (stockQuantity >= 0);

--Constraints added to 'StockRequests'
ALTER TABLE StockRequests ADD CONSTRAINT FK_StockRequests1 FOREIGN KEY (RequestingStoreID) REFERENCES Stores(StoreID);
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

-- Queries For Implementation:
-- VIEWS
-- 1. Business & Store Summary (Retrieve all stores & managers linked to a business)
-- BusinessID, BusinessName, StoreID, StoreName, StoreAddress, ManagerID, ManagerName, ManagerEmail

-- 2. Warehouse Inventory Levels (Quickly fetch available stock for a specific warehouse.)
-- StoreID, StoreName, ProductID, ProductName, StockQuantity

-- 3. Pending Stock Requests (Fetch pending requests efficiently.)
-- RequestID, RequestingStoreID, StoreName, ProductID, ProductName, RequestedQuantity, RequestStatus, RequestDate

-- 4. View for Unread Notifications
-- NotificationID, RecipientUserID, NotificationType, MessageContent, CreatedAt, ReadStatus

-- INSERTION  QUERIES
-- 1. Insert Owner and Business Together
GO
CREATE PROCEDURE insert_OwnersAndBusiness 
        @O_name VARCHAR(255), 
	 @O_email VARCHAR(255),
	 @O_username VARCHAR(255), 
	 @O_password VARCHAR(255),
	 @BusinessName VARCHAR(255) ,
	 @HQAddress VARCHAR(255)     
	 
AS
BEGIN 
    INSERT INTO Owners(name,email,username,password)
	VALUES(@O_name,@O_email,@O_username,@O_password);

	INSERT INTO Business(BusinessName,HQAddress,OwnerID)
	VALUES(@BusinessName,@HQAddress,SCOPE_IDENTITY());


END;
GO
-- 2. Insert Manager
GO
CREATE PROCEDURE insert_Managers 
       @name VARCHAR(255), 
	  @email VARCHAR(255),
	  @username VARCHAR(255), 
	  @password VARCHAR(255), 
	  @businessID INT, 
	  @assignedStore INT 
AS
BEGIN 
    INSERT INTO Managers(name,email,username,password,businessID,assignedStore)
	VALUES(@name,@email,@username,@password, @businessID,@assignedStore);

END;
GO

-- 3. Insert Store / Warehouse

CREATE PROCEDURE insert_Stores 
	@StoreName VARCHAR(255) ,
	@BusinessID INT ,
	@StoreAddress VARCHAR(255)  ,  
	@ManagerID INT  
 
AS
BEGIN 
    INSERT INTO Stores(StoreName,BusinessID,StoreAddress,ManagerID)
	VALUES(@StoreName,@BusinessID,@StoreAddress,@ManagerID);

END;

-- 4. Insert Product
GO

GO
CREATE PROCEDURE insert_Products  
	@ProductName VARCHAR(255),
	@BusinessID INT,
	@Category VARCHAR(255),
	@PricePerUnit DECIMAL(10,2)
 
AS
BEGIN 
    INSERT INTO Products(ProductName,BusinessID,Category,PricePerUnit)
	VALUES(@ProductName,@BusinessID,@Category,@PricePerUnit);

END;
Go

GO
-- 5. Insert Product in a Warehouse
GO
CREATE PROCEDURE insert_ProductinWarehouse  
	@warehouseID INT,
	@ProductID INT,
	@stockQuantity INT  
 
AS
BEGIN 
     --if the product detail does not already exist
     IF NOT EXISTS (SELECT 1
	                FROM Inventory WHERE warehouseID=@warehouseID AND ProductID=@ProductID)
	INSERT INTO Inventory (warehouseID, ProductID, stockQuantity)
        VALUES (@warehouseID, @ProductID, @stockQuantity);
		
     ELSE
      --if the product already exists in inventory only update the stock quantity
	 UPDATE Inventory
	 SET stockQuantity = stockQuantity + @stockQuantity
	 WHERE warehouseID=@warehouseID AND ProductID=@ProductID;
        
END;
GO
-- 6. Insert Stock Request
GO
CREATE PROCEDURE  insert_StockRequests
	@RequestingStoreID INT,
	@ProductID INT,
	@RequestedQuantity INT,
	@ReqStatus INT,
	@request_date DATETIME,
	@approvedby INT,
	@fullfillmentdate DATETIME
 
AS
BEGIN 
    INSERT INTO  StockRequests(RequestingStoreID,ProductID,RequestedQuantity,ReqStatus,request_date,approvedby,fullfillmentdate)
	VALUES(@RequestingStoreID,@ProductID,@RequestedQuantity,@ReqStatus,@request_date,@approvedby,@fullfillmentdate);

END;
GO
-- 7. Insert Notification

GO
CREATE PROCEDURE  insert_Notifications 
	@RecipientUserID INT,
	@n_Type INT,
	@Content VARCHAR(MAX),               
	@created_at DATETIME,
	@ReadStatus INT 
 
AS
BEGIN 
    INSERT INTO Notifications(RecipientUserID,n_Type,Content,created_at,ReadStatus)
	VALUES(@RecipientUserID,@n_Type,@Content,@created_at,@ReadStatus);

END;
GO

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

-- Following should fail due to the added unique constraint

INSERT INTO RequestStatus VALUES
('Pending'), ('Approved'), ('Rejected'), ('In Progress'), ('Completed');
GO

INSERT INTO NotificationType VALUES
('Low Stock'),  ('Restock Request'), ('System Alert');
GO

INSERT INTO read_status VALUES
('Unread'), ('Read');
GO

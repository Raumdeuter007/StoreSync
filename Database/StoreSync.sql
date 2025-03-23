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
	RequestID INT IDENTITY (1, 1),
	RequestingStoreID INT NOT NULL,
	ProductID INT NOT NULL,
	RequestedQuantity INT NOT NULL,
	ReqStatus INT DEFAULT 1,
	request_date DATETIME DEFAULT GETDATE() NOT NULL,
	approvedby INT DEFAULT NULL,
	fullfillmentdate DATETIME DEFAULT NULL
);

ALTER TABLE StockRequests ADD CONSTRAINT PK_StockRequests PRIMARY KEY (RequestID);

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
ALTER TABLE StockRequests ADD CONSTRAINT UQ_StockRequests UNIQUE (RequestingStoreID, ProductID, request_date);
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


-- INSERTION QUERIES
-- 1. Insert Owner and Business Together
GO
CREATE PROCEDURE insert_OwnersAndBusiness 
    @O_name VARCHAR(255), 
    @O_email VARCHAR(255),
    @O_username VARCHAR(255), 
    @O_password VARCHAR(255),
    @BusinessName VARCHAR(255),
    @HQAddress VARCHAR(255)     
AS
BEGIN 
    INSERT INTO Owners(name, email, username, password)
    VALUES(@O_name, @O_email, @O_username, @O_password);

    INSERT INTO Business(BusinessName, HQAddress, OwnerID)
    VALUES(@BusinessName, @HQAddress, SCOPE_IDENTITY());
END;
GO

-- 2. Insert Manager
GO
CREATE PROCEDURE insert_Managers 
    @name VARCHAR(255), 
    @email VARCHAR(255),
    @username VARCHAR(255), 
    @password VARCHAR(255), 
    @businessID INT 
AS
BEGIN 
    INSERT INTO Managers(name, email, username, password, businessID)
    VALUES(@name, @email, @username, @password, @businessID);
END;
GO

-- 3. Insert Store / Warehouse
GO
CREATE PROCEDURE insert_Stores 
    @StoreName VARCHAR(255),
    @BusinessID INT,
    @StoreAddress VARCHAR(255)
AS
BEGIN 
    INSERT INTO Stores(StoreName, BusinessID, StoreAddress)
    VALUES(@StoreName, @BusinessID, @StoreAddress);
END;
GO

-- 4. Insert Product
GO
CREATE PROCEDURE insert_Products  
    @ProductName VARCHAR(255),
    @BusinessID INT,
    @Category VARCHAR(255),
    @PricePerUnit DECIMAL(10,2)
AS
BEGIN 
    INSERT INTO Products(ProductName, BusinessID, Category, PricePerUnit)
    VALUES(@ProductName, @BusinessID, @Category, @PricePerUnit);
END;

-- 5. Insert Product in a Warehouse
GO
CREATE PROCEDURE insert_ProductinWarehouse  
	@warehouseID INT,
	@ProductID INT
AS
BEGIN 
     -- if the product detail does not already exist
     --IF NOT EXISTS (SELECT 1
	    --            FROM Inventory WHERE warehouseID = @warehouseID AND ProductID = @ProductID)	
	INSERT INTO Inventory (warehouseID, ProductID)
        VALUES (@warehouseID, @ProductID);

  --   ELSE
  --    -- if the product already exists in inventory only update the stock quantity
	 --UPDATE Inventory
	 --SET stockQuantity = stockQuantity + @stockQuantity
	 --WHERE warehouseID = @warehouseID AND ProductID = @ProductID;

END;

-- 6. Insert Stock Request
GO
CREATE PROCEDURE insert_StockRequests
	@RequestingStoreID INT,
	@ProductID INT,
	@RequestedQuantity INT,
	@message VARCHAR(MAX)
AS
BEGIN 
    INSERT INTO StockRequests(RequestingStoreID, ProductID, RequestedQuantity, request_date)
	VALUES(@RequestingStoreID, @ProductID, @RequestedQuantity, GETDATE());
	
	DECLARE @O_id INT;
	SET @O_id = (SELECT OwnerID FROM Business JOIN Products ON Products.BusinessID = Business.BusinessID
	WHERE ProductID = @ProductID);

	INSERT INTO Notifications(RecipientUserID, n_Type, Content, created_at, ReadStatus)
	VALUES(@O_ID, 2, @message, GETDATE(), 1);

END;
GO

--UPDATE QUERIES
-- 1. Update Owner Details

--GO
--CREATE PROCEDURE UpdateOwners
--    @ColumnName VARCHAR(128),
--    @NewVal VARCHAR(255),
--    @OwnerId INT
--AS
--BEGIN
--    SET NOCOUNT ON;

--    DECLARE @SQL NVARCHAR(MAX);
--    DECLARE @RetCode INT = 0;
--    DECLARE @ERRNO NVARCHAR(4000) = NULL;

--    -- Check for NULL parameters
--    IF @ColumnName IS NULL OR @OwnerId IS NULL
--    BEGIN
--        SET @RetCode = -1;
--        SET @ERRNO = 'NULL_PARAM';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--        RETURN;
--    END

--    -- Check for NULL or empty NewVal (all columns NOT NULL)
--    IF @NewVal IS NULL OR @NewVal = ''
--    BEGIN
--        SET @RetCode = -1;
--        SET @ERRNO = 'INVALID_VAL: Value cannot be NULL or empty';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--        RETURN;
--    END

--    -- Validate ColumnName
--    IF NOT EXISTS (
--        SELECT 1 
--        FROM sys.columns 
--        WHERE object_id = OBJECT_ID('Owners') 
--        AND name = @ColumnName
--    )
--    BEGIN
--        SET @RetCode = -1;
--        SET @ERRNO = 'INVALID_COLUMN: ' + @ColumnName;
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--        RETURN;
--    END

--    -- Prevent updating IDENTITY column
--    IF @ColumnName = 'ownerID'
--    BEGIN
--        SET @RetCode = -1;
--        SET @ERRNO = 'IDENTITY_UPDATE: Cannot update ownerID';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--        RETURN;
--    END

--    -- Check email constraint
--    IF @ColumnName = 'email' AND @NewVal NOT LIKE '%@%'
--    BEGIN
--        SET @RetCode = -1;
--        SET @ERRNO = 'EMAIL_FORMAT: Email must contain @';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--        RETURN;
--    END

--    -- Check uniqueness for email and username (excluding current row)
--    IF @ColumnName IN ('email', 'username')
--        AND EXISTS (
--            SELECT 1 
--            FROM Owners 
--            WHERE (@ColumnName = 'email' AND email = @NewVal)
--               OR (@ColumnName = 'username' AND username = @NewVal)
--            AND ownerID != @OwnerId
--        )
--    BEGIN
--        SET @RetCode = -1;
--        SET @ERRNO = 'UNIQUE_VIOLATION: Duplicate ' + @ColumnName;
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--        RETURN;
--    END

--    -- Check if OwnerId exists
--    IF NOT EXISTS (SELECT 1 FROM Owners WHERE ownerID = @OwnerId)
--    BEGIN
--        SET @RetCode = -1;
--        SET @ERRNO = 'NO_RECORD: OwnerID ' + CAST(@OwnerId AS VARCHAR(10)) + ' not found';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--        RETURN;
--    END

--    BEGIN TRY
--        -- Build and execute dynamic SQL
--        SET @SQL = 'UPDATE Owners SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE ownerID = @OwnerId';
--        EXEC sp_executesql @SQL, 
--            N'@NewVal VARCHAR(255), @OwnerId INT', 
--            @NewVal, @OwnerId;

--        -- Success response
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--   END TRY

--   BEGIN CATCH
--    SET @RetCode = -1;
--    SET @ERRNO = 'RUNTIME_ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--    SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--  END CATCH

--END;
--GO

--select * from Owners;

--EXEC UpdateOwners 'name','hellina','10'


---- 2. Update Manager Details
--GO
--CREATE PROCEDURE UpdateManagers
--    @ColumnName VARCHAR(128),
--    @NewVal VARCHAR(255), -- Most columns are VARCHAR(255), INT handled below
--    @ManagerId INT
--AS
--BEGIN
--    SET NOCOUNT ON;
--    DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--    IF @ColumnName IS NULL OR @ManagerId IS NULL OR (@NewVal IS NULL AND @ColumnName != 'assignedStore')
--    BEGIN
--        SET @RetCode = -1; 
--		SET @ERRNO = 'NULL_PARAM';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--		RETURN;
--    END

--    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Managers') AND name = @ColumnName)
--    BEGIN
--        SET @RetCode = -1; 
--		SET @ERRNO = 'INVALID_COLUMN: ' + @ColumnName;
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--		RETURN;
--    END

--    IF @ColumnName = 'managerID'
--    BEGIN
--        SET @RetCode = -1; 
--		SET @ERRNO = 'IDENTITY_UPDATE: Cannot update managerID';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO; 
--		RETURN;
--    END

--    IF @ColumnName = 'email' AND @NewVal NOT LIKE '%@%'
--    BEGIN
--        SET @RetCode = -1; 
--		SET @ERRNO = 'EMAIL_FORMAT: Email must contain @';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO; 
--		RETURN;
--    END

--    IF @ColumnName IN ('email', 'username') AND EXISTS 
--	(
--        SELECT 1 
--		FROM Managers 
--		WHERE (@ColumnName = 'email' AND email = @NewVal) OR (@ColumnName = 'username' AND username = @NewVal)  --Match duplicate email/username 
--        AND managerID != @ManagerId     -- But not with the column being updated itself
--	)
--    BEGIN
--        SET @RetCode = -1;
--		SET @ERRNO = 'UNIQUE_VIOLATION: Duplicate ' + @ColumnName;
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO; 
--		RETURN;
--    END

--    IF @ColumnName = 'assignedStore' AND @NewVal IS NOT NULL AND EXISTS
--	(
--		SELECT 1 FROM Managers 
--		WHERE assignedStore = 
--		CAST(@NewVal AS INT) AND managerID != @ManagerId
--	) 
--    BEGIN
--        SET @RetCode = -1; 
--		SET @ERRNO = 'UNIQUE_VIOLATION: Duplicate assignedStore';
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO; 
--		RETURN;
--    END
   
--    IF @ColumnName = 'businessID'
--	AND  NOT EXISTS 
--	(
--		 SELECT 1 
--		 FROM Business
--		 WHERE BusinessID = CAST(@NewVal AS INT) AND @ColumnName = 'businessID'
--	) 
--    BEGIN
--		SET @RetCode = -1;
--		SET @ERRNO = 'FK_VIOLATION: Invalid ' + 'businessID';
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--		RETURN;
--    END

--	IF @ColumnName = 'assignedStore' AND @NewVal iS NOT NULL
--	AND NOT EXISTS
--	(
--		SELECT 1
--		FROM Stores
--		WHERE StoreID = @NewVal
--	)
--	BEGIN
--		SET @RetCode = -1; 
--		SET @ERRNO = 'FK_VIOLATION: Invalid ' + 'businessID';
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--		RETURN;
--    END


--    IF NOT EXISTS (SELECT 1 FROM Managers WHERE managerID = @ManagerId)
--    BEGIN
--        SET @RetCode = -1;
--		SET @ERRNO = 'NO_RECORD: ManagerID ' + CAST(@ManagerId AS VARCHAR(10));
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO; 
--		RETURN;
--    END

--    BEGIN TRY
--        SET @SQL = 'UPDATE Managers SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE managerID = @ManagerId';
--        EXEC sp_executesql @SQL, N'@NewVal VARCHAR(255), @ManagerId INT', @NewVal, @ManagerId;
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--    END TRY
--    BEGIN CATCH
--        SET @RetCode = -1;
--        SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--    END CATCH
--END;
--GO

--Select * from Managers

--EXEC UpdateManagers 'name', 'Aamirah Tariq Khan', 4    
--Select * from Managers

---- 3. Update Business Details
--GO
--CREATE PROCEDURE UpdateBusiness
--	@ColumnName VARCHAR(128),
--	@NewVal VARCHAR(255),
--	@BusinessId INT
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE Business SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE BusinessId  = @BusinessId ';
--        EXEC sp_executesql @SQL, N'@NewVal VARCHAR(255), @BusinessId INT', @NewVal, @BusinessId;
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--        SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--        SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END
--GO

--Select * from Business

----will fail
--EXEC UpdateBusiness 'OwnerID', '122', 4
--Select * from Business

----Will succeed
--Select * from Business

--EXEC UpdateBusiness 'BusinessName', 'Khan Enterprises', 1
--Select * from Business

---- 4. Update Store Details
--GO
--CREATE PROCEDURE UpdateStores
--	@ColumnName VARCHAR(128),
--	@NewVal VARCHAR(255),
--	@StoreId INT
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE Stores SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE StoreId  = @StoreId ';
--		EXEC sp_executesql @SQL, N'@NewVal VARCHAR(255), @StoreId INT', @NewVal, @StoreId;
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--		SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END
--GO

----5. Update Product Details
--GO
--CREATE PROCEDURE UpdateProducts
--	@ColumnName VARCHAR(128),
--	@NewVal VARCHAR(255),
--	@ProductId INT
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE Products SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE ProductId  = @ProductId ';
--		EXEC sp_executesql @SQL, N'@NewVal VARCHAR(255), @ProductId INT', @NewVal, @ProductId;
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--		SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END
--GO

----6. Update Inventory Details
--GO
--CREATE PROCEDURE UpdateInventory
--	@ColumnName VARCHAR(128),
--	@NewVal INT,
--	@WarehouseId INT,
--	@ProductId INT
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE Inventory SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE warehouseID  = @WarehouseId AND ProductID = @ProductId';
--		EXEC sp_executesql @SQL, N'@NewVal INT, @WarehouseId INT, @ProductId INT', @NewVal, @WarehouseId, @ProductId;
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--		SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END
--GO

----7. Update Stock Requests
--GO
--CREATE PROCEDURE UpdateStockRequests
--	@ColumnName VARCHAR(128),
--	@NewVal INT,
--	@RequestingStoreId INT,
--	@ProductId INT,
--	@RequestDate DATETIME
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE StockRequests SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE RequestingStoreId  = @RequestingStoreId AND ProductID = @ProductId AND request_date = @RequestDate';
--		EXEC sp_executesql @SQL, N'@NewVal INT, @RequestingStoreId INT, @ProductId INT, @RequestDate DATETIME', @NewVal, @RequestingStoreId, @ProductId, @RequestDate;
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--		SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END

---- 8. Change store manager
--CREATE PROCEDURE update_manager @ManagerID INT, @StoreID INT
--AS
--BEGIN 
--	IF EXISTS (SELECT * FROM Managers WHERE ManagerID = @ManagerID AND assignedStore IS NULL)
--	BEGIN
--		UPDATE Stores SET ManagerID = @ManagerID WHERE StoreID = @StoreID;
--		UPDATE Managers SET assignedStore = @StoreID WHERE managerID = @ManagerID;
--	END;
--	ELSE
--		return cast('Can not update manager: Already assigned.' as int);
--END;
--GO

---- 9. Update Notifications
--GO
--CREATE PROCEDURE UpdateNotifications
--	@ColumnName VARCHAR(128),
--	@NewVal INT,
--	@NotificationId INT
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE Notifications SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE NotificationId  = @NotificationId';
--		EXEC sp_executesql @SQL, N'@NewVal INT, @NotificationId INT', @NewVal, @NotificationId;
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--		SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END

---- 10. Update Notification Type
--GO
--CREATE PROCEDURE UpdateNotificationType
--	@ColumnName VARCHAR(128),
--	@NewVal VARCHAR(255),
--	@NotificationId INT
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE NotificationType SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE NotificationId  = @NotificationId';
--		EXEC sp_executesql @SQL, N'@NewVal VARCHAR(255), @NotificationId INT', @NewVal, @NotificationId;
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--		SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END

---- 11. Update Read Status
--GO
--CREATE PROCEDURE UpdateReadStatus
--	@ColumnName VARCHAR(128),
--	@NewVal INT,
--	@StatusId INT
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE read_status SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE StatusId  = @StatusId';
--		EXEC sp_executesql @SQL, N'@NewVal INT, @StatusId INT', @NewVal, @StatusId;
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--		SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END

---- 12. Update Request Status
--GO
--CREATE PROCEDURE UpdateRequestStatus
--	@ColumnName VARCHAR(128),
--	@NewVal INT,
--	@StatusId INT
--AS
--BEGIN
--	SET NOCOUNT ON;
--	DECLARE @SQL NVARCHAR(MAX)
--	DECLARE @RetCode INT = 0
--	DECLARE @ERRNO NVARCHAR(4000) = NULL;

--	BEGIN TRY
--		SET @SQL = 'UPDATE RequestStatus SET ' + QUOTENAME(@ColumnName) + ' = @NewVal WHERE StatusId  = @StatusId';
--		EXEC sp_executesql @SQL, N'@NewVal INT, @StatusId INT', @NewVal, @StatusId;
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END TRY

--	BEGIN CATCH
--		SET @RetCode = -1;
--		SET @ERRNO = 'ERROR_' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
--		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO;
--	END CATCH
--END



-- SELECTION QUERIES
--  1. Verify Username and Password, return user details if valid

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
--1. Remove store -> Remove data from the respective inventory and stock requests
GO
CREATE PROCEDURE delete_store @StoreID INT
AS 
BEGIN
	DELETE FROM Stores WHERE StoreID = @StoreID;
END;
GO

--2. Remove Products
CREATE PROCEDURE delete_product @ProductID INT
AS 
BEGIN
	-- deletion from inventory and stockRequests already catered through cascading
	DELETE FROM Products WHERE ProductID = @ProductID;
END;
GO

--3. Delete Business
-- Should not allow this 
--CREATE PROCEDURE delete_Business @BusinessID INT
--AS 
--BEGIN
--    DELETE FROM Stores WHERE BusinessID = @BusinessID;
	
--	DELETE FROM Products WHERE BusinessID = @BusinessID; 

--	DELETE FROM Business WHERE BusinessID = @BusinessID;

--END;
--GO

--4. Remove Stock requests when the requesting store asks to cancel request -> If not processed, can be cancelled

CREATE PROCEDURE Cancel_StockRequest @RequestID INT
AS
BEGIN 

    IF (SELECT ReqStatus FROM StockRequests 
	    WHERE RequestID = @RequestID ) = 'Pending'
		 
    BEGIN
        DELETE FROM StockRequests WHERE RequestID = @RequestID;
    END
    ELSE
    BEGIN
        PRINT 'The request has been processed.';
    END
END;
GO

-- 5. Remove record of the Requests that have been completed

CREATE PROCEDURE Remove_Completed_StockRequest 
AS
BEGIN
	 DELETE FROM StockRequests WHERE ReqStatus = 'Completed';
END;
GO

--6. Remove notifications that have been read 

CREATE PROCEDURE Remove_Read_Notifications @ownerID INT
AS
BEGIN
    DELETE FROM Notifications WHERE ReadStatus = 'Read' AND RecipientUserID = @ownerID;

END;
GO

 
--7. Remove manager without assigned store

CREATE PROCEDURE delete_manager_withNoAssignedStore @ManagerID INT
AS
BEGIN
    IF (SELECT assignedStore FROM Managers WHERE ManagerID = @ManagerID) IS NULL
	BEGIN
       DELETE FROM Managers WHERE ManagerID = @ManagerID;
    END
    ELSE
	BEGIN
	  PRINT 'Cannot remove! Manager Assigned to a store';
    END
     
END;
GO

-- 8. Remove manager from assigned store
--CREATE PROCEDURE delete_manager_withAssignedStore @ManagerID INT
--AS
--BEGIN
--    UPDATE Stores SET ManagerID = NULL WHERE ManagerID = @ManagerID;
--	UPDATE Managers SET assignedStore = NULL WHERE ManagerID = @ManagerID;
--END;
--GO

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

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

	 -- Declaration and assignment of variable in single line
	DECLARE @insertedStoreId INT = SCOPE_IDENTITY(); -- SCOPE_IDENTITY() Returns the last identity value inserted in the current scope (same procedure, function, or batch).  
	
	--DECLARE @insertedStoreId INT;               -- Declaration in one line
    -- SET @insertedStoreId = SCOPE_IDENTITY();    -- and Assignment of variable in next line

	-- Reflect assignment of Manager to new store ==> Manager assigned to manager <--> Store assigned to Manager
	UPDATE Managers 
	SET assignedStore = @insertedStoreId
	where ManagerID = @ManagerID

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
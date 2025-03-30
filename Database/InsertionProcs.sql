USE InventoryManagementSystem
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

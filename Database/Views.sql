use InventoryManagementSystem
GO

-- 1. Business & Store Summary (Retrieve all stores & managers linked to a business)
-- BusinessID, BusinessName, StoreID, StoreName, StoreAddress, ManagerID, ManagerName, ManagerEmail
GO
CREATE VIEW ABusinessStoreOverview AS
(
	SELECT B.BusinessID, B.BusinessName, S.StoreID, S.StoreName, S.StoreAddress,M.managerID, M.name AS ManagerName, M.email AS ManagerEmail
	FROM Business AS B LEFT JOIN Managers AS M      --LEFT JOIN for a state when a business has no managers
	ON B.BusinessID = M.businessID
	LEFT JOIN Stores as S
	ON S.BusinessID = B.BusinessID   -- Ensuring all stores are included, even those without managers(max 1 such at a time which is going to be deleted soon)
)
GO

--GO
--CREATE PROCEDURE BusinessStoreSummary (
--@BusinessID INT
--)
--AS
--BEGIN
--	DECLARE @RetCode INT = 0   --Return value to return ==> 0: success, -1: failure
--	DECLARE @ERRNO NVARCHAR(4000) = NULL

--	BEGIN TRY
--		SELECT BusinessID, BusinessName, StoreID, StoreName,StoreAddress,managerID,ManagerName,ManagerEmail
--		FROM ABusinessStoreOverview AS ABSO
--		WHERE ABSO.BusinessID = @BusinessID

--		-- Return success response --> retcode = 0, ERRNO = NULL
--		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
--	END TRY
--	BEGIN CATCH
--		SET @RetCode = -1
--		SET @ERRNO = ERROR_MESSAGE()   --  ERROR_MESSAGE(): Returns the error message of the most recent error in the nearest CATCH block.
--		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
--	END CATCH
--END
--GO

Insert Into Owners
values('helli', 'hellybelly@jelly.com','bellyhelly124', '1011011')

INSERT INTO Owners (name, email, username, password)  
VALUES  
('John Doe', 'john.doe@email.com', 'johndoe', 'SecurePass123'),  
('Alice Smith', 'alice.smith@email.com', 'alicesmith', 'Alice#2024'),  
('Michael Johnson', 'michael.j@email.com', 'mikejohnson', 'MJ@SuperSecure1'),  
('Emily Davis', 'emily.d@email.com', 'emilyd', 'Davis!321'),  
('Robert Brown', 'robert.b@email.com', 'robbrown', 'Brownie2024!');

INSERT INTO Business (BusinessName, HQAddress, OwnerID)  
VALUES  
('Tech Innovators', '123 Silicon Valley, CA', 1),  
('Healthy Bites', '456 Greenway Ave, NY', 2),  
('Elite Fitness', '789 Gym Street, TX', 3),  
('Urban Styles', '101 Fashion Lane, FL', 4),  
('Gourmet Delights', '202 Fine Dining Rd, IL', 5),  
('Secure Solutions', '303 Cyber Park, WA', 6);

INSERT INTO Managers (name, email, username, password, businessID, assignedStore)  
VALUES  
('Alice Johnson', 'alice.johnson@email.com', 'aliceJ', 'securepass1', 1, NULL),  
('Bob Smith', 'bob.smith@email.com', 'bobS', 'securepass2', 1, NULL),  
('Charlie Brown', 'charlie.brown@email.com', 'charlieB', 'securepass3', 2, NULL),  
('Diana White', 'diana.white@email.com', 'dianaW', 'securepass4', 3, NULL),  
('Ethan Green', 'ethan.green@email.com', 'ethanG', 'securepass5', 3, NULL),  
('Fiona Black', 'fiona.black@email.com', 'fionaB', 'securepass6', 4, NULL),  
('George Harris', 'george.harris@email.com', 'georgeH', 'securepass7', 4, NULL),  
('Hannah King', 'hannah.king@email.com', 'hannahK', 'securepass8', 5, NULL),  
('Ian Wright', 'ian.wright@email.com', 'ianW', 'securepass9', 6, NULL),  
('Julia Adams', 'julia.adams@email.com', 'juliaA', 'securepass10', 6, NULL);


-- Insert exactly 7 stores, each assigned to a unique valid manager (1 to 10)
EXEC insert_Stores 'Store A', 1, 'Address A', 4;  -- ManagerID 1
EXEC insert_Stores 'Store C', 1, 'Address C', 1;  -- ManagerID 3
EXEC insert_Stores 'Store D', 3, 'Address D', 2;  -- ManagerID 4
EXEC insert_Stores 'Store E', 2, 'Address E', 5;  -- ManagerID 5
EXEC insert_Stores 'Store F', 2, 'Address F', 10;  -- ManagerID 6
EXEC insert_Stores 'Store G', 5, 'Address G', 7;  -- ManagerID 7
EXEC insert_Stores 'Store A', 5, 'Address I', 9;  -- ManagerID 7



Go

-- 2. Warehouse Inventory Levels (Quickly fetch available stock for a specific warehouse.)
-- StoreID, StoreName, ProductID, ProductName, StockQuantity

GO
CREATE VIEW AllWInventoryLvls AS
(
	Select I.warehouseID,S.StoreName AS [Warehouse Name], I.ProductID, P.ProductName, I.stockQuantity, S.ManagerID
	from Inventory AS I INNER JOIN Stores as S
	ON I.warehouseID = S.StoreID
	INNER JOIN Products AS P
	ON I.ProductID = P.ProductID 
)

GO
-- Return Inventory levels of each product in stock for user-input warehouse
CREATE PROCEDURE FetchInventoryLevels(
	@WarehouseName VARCHAR(255),   
	@WarehouseManager INT
)
AS
BEGIN
	DECLARE @RetCode INT = 0   --Return value to return ==> 0: success, -1: failure
	DECLARE @ERRNO NVARCHAR(4000) = NULL   --return error description/type ==>NULL if no ERROR ==> only check if return value != 0  --size chosen to match return type of ERROR_MESSAGE()
	
	IF NOT EXISTS  --ensure that a manager can only access warehouses managed by them.
	(
		SELECT 1
		FROM Stores as S
		where S.StoreName = @WarehouseName AND S.ManagerID = @WarehouseManager
	)
	BEGIN
		SET @RetCode = -1
		SET @ERRNO = 'WAREHOUSE_NOT_FOUND';    --No warehouse by the name of @WarehouseName relative to Manager(They only see/know the existence of warehouses managed by them)
		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
		RETURN                               -- If the warehouse is not found, the procedure exits early
	END

	-- If Warehouse does exist return required details
	BEGIN TRY
		SELECT warehouseID, [Warehouse Name], ProductID, ProductName, stockQuantity  
		FROM AllWInventoryLvls AS AWIL
		WHERE AWIL.[Warehouse Name] = @WarehouseName AND AWIL.ManagerID = @WarehouseManager

		-- Return success response --> retcode = 0, ERRNO = NULL
		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
	END TRY
	BEGIN CATCH
		SET @RetCode = -1
		SET @ERRNO = ERROR_MESSAGE()   --  ERROR_MESSAGE(): Returns the error message of the most recent error in the nearest CATCH block.
		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
	END CATCH

END
GO


-- 3. Pending Stock Requests (Fetch pending requests efficiently.)
-- RequestingStoreID, StoreName, ProductID, ProductName, RequestedQuantity, RequestStatus, RequestDate
GO
-- Shows all pending requests for all stores
CREATE VIEW APendingReqs AS
(	
	SELECT S.StoreID AS RequestingStoreID, S.StoreName, P.ProductID, SR.RequestedQuantity, SR.ReqStatus, SR.request_date, S.ManagerID
	FROM Stores as S INNER JOIN StockRequests AS SR
	ON S.StoreID = SR.RequestingStoreID
	INNER JOIN Products AS P
	ON SR.ProductID = P.ProductID
)
GO


GO

--Use StoreName to find store
CREATE PROCEDURE ShowPendingRequests (
@SToreManager INT
)
AS
BEGIN
	DECLARE @RetCode INT = 0   --Return value to return ==> 0: success, -1: failure
	DECLARE @ERRNO NVARCHAR(4000) = NULL
	IF NOT EXISTS
	(
		SELECT 1
		FROM APendingReqs AS APR
		WHERE APR.ManagerID = @SToreManager
	)
	BEGIN
		SET @RetCode = -1
		SET @ERRNO = 'NO_RES';
		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO
		RETURN     --Return early
	END

	BEGIN TRY
		SELECT RequestingStoreID, StoreName, ProductID, RequestedQuantity, ReqStatus, request_date,ManagerID
		FROM APendingReqs AS APR
		WHERE APR.ManagerID = @SToreManager;
		
		-- Return success response --> retcode = 0, ERRNO = NULL
		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
	END TRY
	BEGIN CATCH
		SET @RetCode = -1
		SET @ERRNO = ERROR_MESSAGE()   --  ERROR_MESSAGE(): Returns the error message of the most recent error in the nearest CATCH block.
		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
	END CATCH
END
GO

-- 4. View for Unread Notifications
-- NotificationID, RecipientUserID, NotificationType, MessageContent, CreatedAt, ReadStatus
GO
CREATE VIEW AUnreadNotifications AS
(
	SELECT N.NotificationID, N.RecipientUserID, NT.nType AS NotificationType, N.Content AS MessageContent, N.created_at AS CreatedAt, RT.StatusName AS ReadStatus
	FROM Notifications AS N INNER JOIN read_status AS RT 
	ON N.ReadStatus = RT.StatusID
	INNER JOIN NotificationType AS NT
	ON N.n_Type = NT.notificationID
	WHERE RT.StatusName = 'unread'
)
GO

SELECT * FROM NotificationType;
SELECT * FROM read_status;
SELECT * FROM Notifications;

GO
CREATE PROCEDURE OUnreadNotifications (
@OwnerID INT
)
AS
BEGIN
	DECLARE @RetCode INT = 0   --Return value to return ==> 0: success, -1: failure
	DECLARE @ERRNO NVARCHAR(4000) = NULL
	IF NOT EXISTS
	(
		SELECT 1
		FROM AUnreadNotifications AS AURN
		WHERE AURN.RecipientUserID = @OwnerID
	)
	BEGIN
		SET @RetCode = -1
		SET @ERRNO = 'NO_RES';
		SELECT @RetCode AS RetCode, @ERRNO AS ERRNO
		RETURN     --Return early
	END
	BEGIN TRY
		SELECT NotificationID, RecipientUserID, NotificationType,MessageContent, CreatedAt,ReadStatus
		FROM AUnreadNotifications AS AURN
		WHERE AURN.RecipientUserID = @OwnerID

	-- Return success response --> retcode = 0, ERRNO = NULL
		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
	END TRY
	BEGIN CATCH
		SET @RetCode = -1
		SET @ERRNO = ERROR_MESSAGE()   --  ERROR_MESSAGE(): Returns the error message of the most recent error in the nearest CATCH block.
		SELECT @RetCode AS RetCode, @ERRNO as ERRNO
	END CATCH
END




SELECT * FROM NotificationType;
SELECT * FROM read_status;
SELECT * FROM Notifications;

SELECT * FROM Owners
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
GO
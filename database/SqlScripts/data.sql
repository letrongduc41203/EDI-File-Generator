CREATE TABLE Orders (
    OrderId        INT IDENTITY(1,1) PRIMARY KEY,
    OrderNo        NVARCHAR(50) UNIQUE NOT NULL,
    Customer       NVARCHAR(200) NOT NULL,
    Port           NVARCHAR(50) NOT NULL,
    ETA            DATETIME NULL,
    Vessel         NVARCHAR(100) NULL,
    Voyage         NVARCHAR(100) NULL,
    Remarks        NVARCHAR(500) NULL,
    Status         NVARCHAR(50) NOT NULL DEFAULT 'Draft',
    CreatedAt      DATETIME NOT NULL DEFAULT GETDATE()
);
CREATE TABLE Containers (
    ContainerId    INT IDENTITY(1,1) PRIMARY KEY,
    OrderId        INT NOT NULL FOREIGN KEY REFERENCES Orders(OrderId) ON DELETE CASCADE,
    ContainerNo    NVARCHAR(20) NOT NULL,
    SealNo         NVARCHAR(50) NULL,
    Weight         INT NULL,
    CargoType      NVARCHAR(50) NULL,
    CreatedAt      DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Container_Order UNIQUE (OrderId, ContainerNo)
);
CREATE TABLE EDITransactions (
    EDIId          INT IDENTITY(1,1) PRIMARY KEY,
    OrderId        INT NOT NULL FOREIGN KEY REFERENCES Orders(OrderId) ON DELETE CASCADE,
    FileContent    NVARCHAR(MAX) NOT NULL,
    Format         NVARCHAR(20) NOT NULL,  -- XML, EDIFACT
    Status         NVARCHAR(50) NOT NULL,  -- Accepted, Pending, Rejected
    SentTime       DATETIME NOT NULL DEFAULT GETDATE(),
    ResponseTime   DATETIME NULL,
    Note           NVARCHAR(200) NULL,
    CreatedAt      DATETIME NOT NULL DEFAULT GETDATE()
);

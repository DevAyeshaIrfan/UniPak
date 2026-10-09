USE [UniPak];
GO

IF OBJECT_ID(N'dbo.SupportRequests', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SupportRequests (
        SupportRequestID INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_SupportRequests PRIMARY KEY,
        ReferenceCode NVARCHAR(32) NOT NULL
            CONSTRAINT UQ_SupportRequests_ReferenceCode UNIQUE,
        RequestType NVARCHAR(20) NOT NULL,
        Name NVARCHAR(120) NOT NULL,
        Email NVARCHAR(254) NOT NULL,
        Subject NVARCHAR(200) NOT NULL,
        Message NVARCHAR(4000) NOT NULL,
        Status NVARCHAR(20) NOT NULL
            CONSTRAINT DF_SupportRequests_Status DEFAULT N'New',
        EmailStatus NVARCHAR(20) NOT NULL
            CONSTRAINT DF_SupportRequests_EmailStatus DEFAULT N'Pending',
        EmailProviderID NVARCHAR(120) NULL,
        EmailError NVARCHAR(500) NULL,
        CreatedAt DATETIME2(0) NOT NULL
            CONSTRAINT DF_SupportRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
        EmailSentAt DATETIME2(0) NULL,
        CONSTRAINT CK_SupportRequests_RequestType
            CHECK (RequestType IN (N'contact', N'bug', N'feature')),
        CONSTRAINT CK_SupportRequests_Status
            CHECK (Status IN (N'New', N'In Progress', N'Resolved', N'Closed')),
        CONSTRAINT CK_SupportRequests_EmailStatus
            CHECK (EmailStatus IN (N'Pending', N'Sent', N'Failed', N'NotConfigured'))
    );

    CREATE INDEX IX_SupportRequests_CreatedAt
        ON dbo.SupportRequests (CreatedAt DESC);
END;
GO

IF DATABASE_PRINCIPAL_ID(N'Unipaklogin') IS NOT NULL
BEGIN
    GRANT SELECT, INSERT, UPDATE ON dbo.SupportRequests TO [Unipaklogin];
END;
GO

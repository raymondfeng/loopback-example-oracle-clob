# loopback-example-oracle-clob
LoopBack example to fetch Oracle CLOB as stream

Please set up the following envionment variables to run the sample application.
See [server/datasource.json](server/datasources.json) for more information.

On Mac or Linux:
```
export ORACLE_HOST=my-oracle-host
export ORACLE_PORT=1521
export ORACLE_USER=my-oracle-user
export ORACLE_PASSWORD=my-oracle-password
export ORACLE_DB=XE
```
On Windows:
```
set ORACLE_HOST=my-oracle-host
set ORACLE_PORT=1521
set ORACLE_USER=my-oracle-user
set ORACLE_PASSWORD=my-oracle-password
set ORACLE_DB=XE
```

To create the `CLOBTEST` table in Oracle database:
```
CREATE TABLE "CLOBTEST" 
(	
   "ID" VARCHAR2(20 BYTE) NOT NULL, 
   "CONTENT" CLOB,
   CONSTRAINT "CLOBTEST_PK" PRIMARY KEY ("ID")
);
```

To create the `GET_CONTENT` stored procedure:
```
create or replace PROCEDURE GET_CONTENT 
(
  ID IN VARCHAR2,
  CONTENT OUT CLOB
) AS 
BEGIN
  SELECT c.CONTENT into CONTENT from CLOBTEST c where c.ID = ID;
END GET_CONTENT;
```


To run the application:
```
node .
```

# Repair Hub Javalin Backend

Requirements
- Java 17
- MySQL 8

Run (PowerShell from repo root)
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"; $env:Path = "$env:JAVA_HOME\bin;$env:Path";
$env:DB_URL = "jdbc:mysql://localhost:3306/repair_hub_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
$env:DB_USERNAME = "root"; $env:DB_PASSWORD = "root";
mvn -f .\backend\pom.xml -q clean package; java -jar .\backend\target\backend-0.1.0.jar
```

Endpoints
- GET /health
- GET /api/users
- GET /api/repair-posts

Migrations
- Flyway runs `classpath:db/migration` at startup.

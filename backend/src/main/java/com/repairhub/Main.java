package com.repairhub;

import io.javalin.Javalin;
import io.javalin.http.Context;
import org.flywaydb.core.Flyway;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        String dbUrl = env("DB_URL", "jdbc:mysql://localhost:3306/repair_hub_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        String dbUser = env("DB_USERNAME", "root");
        String dbPass = env("DB_PASSWORD", "root");

        // Ensure JDBC driver is registered when running shaded jar
        try { Class.forName("com.mysql.cj.jdbc.Driver"); } catch (Exception ignored) {}

        Flyway.configure()
                .dataSource(dbUrl, dbUser, dbPass)
                .locations("classpath:db/migration")
                .load()
                .migrate();

        Javalin app = Javalin.create(conf -> {
            conf.http.defaultContentType = "application/json";
            conf.router.apiBuilder(() -> {});
        }).start(envInt("PORT", 8080));

        app.get("/health", ctx -> ctx.json(Map.of("status", "ok")));
        app.get("/api/users", ctx -> query(ctx, dbUrl, dbUser, dbPass, "SELECT id, username, email FROM users ORDER BY id DESC"));
        app.get("/api/repair-posts", ctx -> query(ctx, dbUrl, dbUser, dbPass, "SELECT id, item_name, success, date FROM repair_posts ORDER BY id DESC"));
    }

    private static void query(Context ctx, String url, String user, String pass, String sql) throws Exception {
        try (Connection c = DriverManager.getConnection(url, user, pass);
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> rows = new ArrayList<>();
            int cols = rs.getMetaData().getColumnCount();
            while (rs.next()) {
                java.util.LinkedHashMap<String, Object> row = new java.util.LinkedHashMap<>();
                for (int i = 1; i <= cols; i++) {
                    row.put(rs.getMetaData().getColumnLabel(i), rs.getObject(i));
                }
                rows.add(row);
            }
            ctx.json(rows);
        }
    }

    private static String env(String k, String d) { String v = System.getenv(k); return v == null || v.isBlank() ? d : v; }
    private static int envInt(String k, int d) { String v = System.getenv(k); try { return v == null ? d : Integer.parseInt(v); } catch (Exception e) { return d; } }
}



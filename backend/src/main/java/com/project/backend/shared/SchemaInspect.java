package com.project.backend.shared;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class SchemaInspect {

    public static void main(String[] args) throws Exception {
        Class.forName("oracle.jdbc.OracleDriver");
        String url = "jdbc:oracle:thin:@localhost:1521/XEPDB1";
        try (Connection conn = DriverManager.getConnection(url, "sirg_app", "chatonnofy")) {
            System.out.println("CONNEXION OK");
            DatabaseMetaData md = conn.getMetaData();
            List<String> tables = listTables(md, conn);
            System.out.println("TABLES: " + tables);
            for (String t : tables) {
                System.out.println("== TABLE " + t + " ==");
                listColumns(md, conn, t);
            }
            for (String t : new String[]{"EMPLOYE", "ENTREPRISE", "POSTE", "BULETIN_PAIE", "PRIME"}) {
                if (tables.contains(t)) {
                    System.out.println("== DATA SAMPLE " + t + " ==");
                    printSample(conn, t);
                }
            }
        }
    }

    static List<String> listTables(DatabaseMetaData md, Connection conn) throws SQLException {
        ResultSet rs = md.getTables(conn.getCatalog(), conn.getSchema(), "%", new String[]{"TABLE"});
        List<String> out = new ArrayList<>();
        while (rs.next()) {
            String name = rs.getString("TABLE_NAME");
            out.add(name);
        }
        return out;
    }

    static void listColumns(DatabaseMetaData md, Connection conn, String table) throws SQLException {
        ResultSet rs = md.getColumns(conn.getCatalog(), conn.getSchema(), table, "%");
        while (rs.next()) {
            System.out.println("  " + rs.getString("COLUMN_NAME") + " " + rs.getString("TYPE_NAME") + " nullable=" + rs.getBoolean("NULLABLE"));
        }
    }

    static void printSample(Connection conn, String table) throws SQLException {
        var rs = conn.createStatement().executeQuery("SELECT * FROM " + table + " FETCH FIRST 5 ROWS ONLY");
        var meta = rs.getMetaData();
        int cols = meta.getColumnCount();
        StringBuilder header = new StringBuilder();
        for (int i = 1; i <= cols; i++) {
            if (i > 1) header.append(" | ");
            header.append(meta.getColumnLabel(i));
        }
        System.out.println("  " + header);
        int n = 0;
        while (rs.next() && n < 5) {
            StringBuilder row = new StringBuilder();
            for (int i = 1; i <= cols; i++) {
                if (i > 1) row.append(" | ");
                Object v = rs.getObject(i);
                row.append(v == null ? "NULL" : v.toString());
            }
            System.out.println("  " + row);
            n++;
        }
    }
}

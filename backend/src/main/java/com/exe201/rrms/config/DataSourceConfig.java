package com.exe201.rrms.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${spring.datasource.url}") String rawUrl,
            @Value("${spring.datasource.username}") String user,
            @Value("${spring.datasource.password}") String pass,
            @Value("${spring.datasource.driverClassName:com.mysql.cj.jdbc.Driver}") String driver
    ) {
        // Strip any accidental newlines, tabs or spaces from copy-paste in deployment environments
        String cleanUrl = rawUrl.replaceAll("[\\r\\n\\s]+", "");
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(cleanUrl);
        ds.setUsername(user != null ? user.trim() : "");
        ds.setPassword(pass != null ? pass.trim() : "");
        ds.setDriverClassName(driver != null ? driver.trim() : "com.mysql.cj.jdbc.Driver");
        return ds;
    }
}

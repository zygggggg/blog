package com.wzy.album;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.wzy.album.mapper")
public class AlbumApplication {
    public static void main(String[] args) {
        SpringApplication.run(AlbumApplication.class, args);
    }
}

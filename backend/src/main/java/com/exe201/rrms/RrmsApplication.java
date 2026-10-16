package com.exe201.rrms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RrmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(RrmsApplication.class, args);
	}

}

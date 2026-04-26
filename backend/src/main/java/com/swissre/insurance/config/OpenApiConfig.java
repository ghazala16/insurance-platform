package com.swissre.insurance.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.*;
import io.swagger.v3.oas.annotations.security.*;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "InsureFlow API",
        version = "1.0.0",
        description = "Cloud-native insurance policy management platform API",
        contact = @Contact(name = "InsureFlow Team", email = "api@insureflow.com")
    ),
//    servers = {
//        @Server(url = "http://localhost:8080", description = "Local Dev"),
//        @Server(url = "https://insureflow-api.azurewebsites.net", description = "Azure Production")
//    }
        servers = {
                @Server(
                        url = "/",
                        description = "Current Environment"
                )
        }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT access token. Obtain via POST /api/v1/auth/login"
)
public class OpenApiConfig {}

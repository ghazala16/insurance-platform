package com.swissre.insurance.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.Set;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String username;

    private String password;
    private String fullName;

    @Builder.Default
    private Set<Role> roles = Set.of(Role.USER);

    private boolean enabled;
    private boolean accountNonLocked;

    // OAuth2 fields
    private String provider;       // LOCAL, AZURE, OKTA
    private String providerId;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum Role {
        USER, MANAGER, ADMIN
    }
}

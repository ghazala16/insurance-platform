package com.swissre.insurance.service.impl;

import com.swissre.insurance.dto.AuthDto;
import com.swissre.insurance.exception.*;
import com.swissre.insurance.model.User;
import com.swissre.insurance.repository.UserRepository;
import com.swissre.insurance.security.JwtService;
import com.swissre.insurance.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Override
    public AuthDto.TokenResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken: " + request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .roles(Set.of(User.Role.USER))
                .enabled(true)
                .accountNonLocked(true)
                .provider("LOCAL")
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getUsername());

        return generateTokenResponse(user);
    }

    @Override
    public AuthDto.TokenResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", request.getUsername()));

        log.info("User logged in: {}", user.getUsername());
        return generateTokenResponse(user);
    }

    @Override
    public AuthDto.TokenResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return generateTokenResponse(user);
    }

    private AuthDto.TokenResponse generateTokenResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        AuthDto.UserInfo userInfo = new AuthDto.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setEmail(user.getEmail());
        userInfo.setFullName(user.getFullName());
        userInfo.setRoles(user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet()));

        AuthDto.TokenResponse response = new AuthDto.TokenResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(900);  // 15 minutes
        response.setUser(userInfo);

        return response;
    }
}

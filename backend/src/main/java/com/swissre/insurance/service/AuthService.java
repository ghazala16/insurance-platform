package com.swissre.insurance.service;

import com.swissre.insurance.dto.AuthDto;

public interface AuthService {
    AuthDto.TokenResponse register(AuthDto.RegisterRequest request);
    AuthDto.TokenResponse login(AuthDto.LoginRequest request);
    AuthDto.TokenResponse refreshToken(String refreshToken);
}

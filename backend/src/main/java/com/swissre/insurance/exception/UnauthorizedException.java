package com.swissre.insurance.exception;
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) { super(message); }
}

package ru.itmo.kursach_back.service.ai;

public class AIGenerationException extends Exception {

    private final String serviceName;
    private final ErrorType errorType;

    public enum ErrorType {
        API_KEY_MISSING,
        API_KEY_INVALID,
        RATE_LIMIT_EXCEEDED,
        CONTENT_POLICY_VIOLATION,
        NETWORK_ERROR,
        INVALID_PARAMETERS,
        SERVICE_UNAVAILABLE,
        UNKNOWN_ERROR
    }

    public AIGenerationException(String message, String serviceName, ErrorType errorType) {
        super(message);
        this.serviceName = serviceName;
        this.errorType = errorType;
    }

    public AIGenerationException(String message, String serviceName, ErrorType errorType, Throwable cause) {
        super(message, cause);
        this.serviceName = serviceName;
        this.errorType = errorType;
    }

    public String getServiceName() {
        return serviceName;
    }

    public ErrorType getErrorType() {
        return errorType;
    }

    @Override
    public String toString() {
        return String.format("AIGenerationException [service=%s, type=%s, message=%s]",
                           serviceName, errorType, getMessage());
    }
}


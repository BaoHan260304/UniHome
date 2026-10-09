package com.exe201.rrms.exception;

import lombok.Getter;
import java.util.Map;

@Getter
public class ValidationException extends RuntimeException {
    private final String code = "VALIDATION_ERROR";
    private final Map<String, String> fieldErrors;

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors != null ? fieldErrors : Map.of();
    }

    public ValidationException(String field, String error) {
        super(error);
        this.fieldErrors = Map.of(field, error);
    }
}

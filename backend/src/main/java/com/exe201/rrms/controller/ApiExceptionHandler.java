package com.exe201.rrms.controller;

import com.exe201.rrms.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidation(ValidationException e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("code", e.getCode());
        body.put("message", e.getMessage());
        body.put("fieldErrors", e.getFieldErrors());
        body.put("path", req.getRequestURI());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> handleNoResource(NoResourceFoundException e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 404);
        body.put("message", "Không tìm thấy tài nguyên: " + e.getResourcePath());
        body.put("path", req.getRequestURI());
        return ResponseEntity.status(404).body(body);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNoSuchElement(NoSuchElementException e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 404);
        body.put("message", e.getMessage() == null ? "Không tìm thấy dữ liệu yêu cầu" : e.getMessage());
        body.put("path", req.getRequestURI());
        return ResponseEntity.status(404).body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handleTypeMismatch(MethodArgumentTypeMismatchException e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("message", "Tham số không hợp lệ: " + e.getName() + " = " + e.getValue());
        body.put("path", req.getRequestURI());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<?> handleSecurity(SecurityException e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 401);
        body.put("message", e.getMessage());
        body.put("path", req.getRequestURI());
        return ResponseEntity.status(401).body(body);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<?> handleBadRuntime(RuntimeException e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("message", e.getMessage());
        body.put("path", req.getRequestURI());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 500);
        body.put("message", e.getMessage() == null ? "Lỗi hệ thống" : e.getMessage());
        body.put("path", req.getRequestURI());
        return ResponseEntity.status(500).body(body);
    }
}

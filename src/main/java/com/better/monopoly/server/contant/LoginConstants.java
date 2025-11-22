package com.better.monopoly.server.contant;

public class LoginConstants {
    public static final String LOGIN_REQUEST = """
            {
                "username": "john_doe"
            }
            """;

    public static final String LOGIN_SUCCESS_RESPONSE = """
            {
                "success": true,
                "message": "Login successful"
            }
            """;

    public static final String LOGIN_BAD_REQUEST_RESPONSE = """
            {
                "success": false,
                "message": "Username cannot be empty"
            }
            """;

    public static final String LOGIN_INTERNAL_ERROR_RESPONSE = """
            {
                "success": false,
                "message": "An unexpected error occurred"
            }
            """;
}

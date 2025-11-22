package com.better.monopoly.server.controller.auth;

import com.better.monopoly.server.controller.auth.dto.LoginRequest;
import com.better.monopoly.server.controller.auth.dto.UserResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @InjectMocks
    private AuthController authController;

    @Test
    void successFullLoginWhenUniqueUsername() {
        LoginRequest loginRequest = LoginRequest.builder().username("user").build();

        UserResponse userResponse = authController.loginUser(loginRequest);

        assertTrue(userResponse.isSuccess());
        assertEquals("Login successful", userResponse.getMessage());
    }
}

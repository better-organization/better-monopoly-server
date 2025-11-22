package com.better.monopoly.server.controller.auth;

import com.better.monopoly.server.contant.LoginConstants;
import com.better.monopoly.server.controller.auth.dto.LoginRequest;
import com.better.monopoly.server.controller.auth.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class AuthController {
    private final String SUCCESS_MESSAGE = "Login successful";

    @PostMapping("login")
    @Operation(
            summary = "User Login",
            description = "Logs in a user with the provided username and assigns them to a room",
            requestBody = @RequestBody(
                    description = "Login request containing username",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = LoginRequest.class),
                            examples = @ExampleObject(
                                    name = "Login Request Example",
                                    description = "Example login request",
                                    value = LoginConstants.LOGIN_REQUEST
                            )
                    )
            )
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Login successful",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = UserResponse.class),
                            examples = @ExampleObject(
                                    name = "Success Response",
                                    description = "Successful login response with username and room ID",
                                    value = LoginConstants.LOGIN_SUCCESS_RESPONSE
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    name = "Bad Request Error",
                                    description = "Error response for invalid input",
                                    value = LoginConstants.LOGIN_BAD_REQUEST_RESPONSE
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(
                                    name = "Internal Server Error",
                                    description = "Error response for internal server errors",
                                    value = LoginConstants.LOGIN_INTERNAL_ERROR_RESPONSE
                            )
                    )
            )
    })
    public UserResponse loginUser(LoginRequest loginRequest) {
        log.info("Login request received for username: {}", loginRequest.getUsername());
        UserResponse userResponse = UserResponse.builder()
                .success(true)
                .message(SUCCESS_MESSAGE)
                .build();
        log.info("Successful login : {}", userResponse);
        return userResponse;
    }
}

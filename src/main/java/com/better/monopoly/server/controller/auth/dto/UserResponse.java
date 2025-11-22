package com.better.monopoly.server.controller.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private String message;
    private boolean success;
}

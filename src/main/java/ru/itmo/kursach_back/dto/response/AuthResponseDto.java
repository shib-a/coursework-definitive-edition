package ru.itmo.kursach_back.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {
    private String token;
    private String type = "Bearer";
    private Integer userId;
    private String username;
    private String authority;

    public AuthResponseDto(String token, Integer userId, String username, String authority) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.authority = authority;
    }
}


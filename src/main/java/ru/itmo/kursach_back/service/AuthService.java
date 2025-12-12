package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.dto.request.LoginRequestDto;
import ru.itmo.kursach_back.dto.request.RegisterRequestDto;
import ru.itmo.kursach_back.dto.response.AuthResponseDto;
import ru.itmo.kursach_back.entity.Account;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.repository.AccountRepository;
import ru.itmo.kursach_back.repository.UserRepository;
import ru.itmo.kursach_back.util.AuthAuthority;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Transactional
    public AuthResponseDto register(RegisterRequestDto registerDto) {

        if (userRepository.findByUsername(registerDto.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        if (accountRepository.findByLogin(registerDto.getLogin()).isPresent()) {
            throw new RuntimeException("Login already exists");
        }

        User user = new User();
        user.setUsername(registerDto.getUsername());
        user.setAuthority(AuthAuthority.USER);
        user.setRegisteredDate(LocalDate.now());
        user = userRepository.save(user);

        Account account = new Account();
        account.setLogin(registerDto.getLogin());
        account.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        account.setUserId(user.getUserId());
        accountRepository.save(account);

        String token = jwtService.generateToken(registerDto.getLogin());

        return new AuthResponseDto(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getAuthority().name()
        );
    }

    public AuthResponseDto login(LoginRequestDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getLogin(),
                        loginDto.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtService.generateToken(authentication);
        User user = userDetailsService.getUserByLogin(loginDto.getLogin());

        return new AuthResponseDto(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getAuthority().name()
        );
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String login = authentication.getName();
        return userDetailsService.getUserByLogin(login);
    }
}


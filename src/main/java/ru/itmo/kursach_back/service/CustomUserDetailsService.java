package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.itmo.kursach_back.entity.Account;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.repository.AccountRepository;
import ru.itmo.kursach_back.repository.UserRepository;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Account account = accountRepository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with login: " + login));

        User user = userRepository.findById(account.getUserId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + account.getUserId()));

        Collection<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(user.getAuthority().name())
        );

        return new org.springframework.security.core.userdetails.User(
                account.getLogin(),
                account.getPassword(),
                authorities
        );
    }

    public User getUserByLogin(String login) {
        Account account = accountRepository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with login: " + login));
        return userRepository.findById(account.getUserId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + account.getUserId()));
    }
}


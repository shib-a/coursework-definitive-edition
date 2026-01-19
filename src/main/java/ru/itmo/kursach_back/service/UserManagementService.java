package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.repository.UserRepository;
import ru.itmo.kursach_back.util.AuthAuthority;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;

        public List<User> getAllUsers() {
        return userRepository.findAll();
    }

        public Optional<User> getUserById(Integer userId) {
        return userRepository.findById(userId);
    }

    @Transactional
    public User updateUserBlockStatus(Integer userId, Boolean blocked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setBlocked(blocked);

        return userRepository.save(user);
    }

    @Transactional
    public User changeUserAuthority(Integer userId, AuthAuthority newAuthority) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setAuthority(newAuthority);

        return userRepository.save(user);
    }

        public List<User> getUsersByAuthority(AuthAuthority authority) {
        return userRepository.findByAuthority(authority);
    }

    public List<User> searchUsersByUsername(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username);
    }

    // Получение общего количества пользователей
    public Long getTotalUsersCount() {
        return userRepository.count();
    }
}


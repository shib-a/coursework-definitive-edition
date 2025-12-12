package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.util.AuthAuthority;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    List<User> findByAuthority(AuthAuthority authority);

    List<User> findByUsernameContainingIgnoreCase(String username);
}


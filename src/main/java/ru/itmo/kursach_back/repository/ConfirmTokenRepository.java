package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.ConfirmToken;

import java.util.Optional;

@Repository
public interface ConfirmTokenRepository extends JpaRepository<ConfirmToken, Integer> {
    Optional<ConfirmToken> findByTokenVal(String tokenVal);
}


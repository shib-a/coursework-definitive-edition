package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.UserFavourite;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavouriteRepository extends JpaRepository<UserFavourite, Integer> {
    List<UserFavourite> findByUserId(Integer userId);
    Optional<UserFavourite> findByUserIdAndDesignId(Integer userId, Integer designId);
    void deleteByUserIdAndDesignId(Integer userId, Integer designId);
}


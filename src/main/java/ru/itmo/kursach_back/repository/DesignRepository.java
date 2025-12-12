package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.Design;

import java.util.List;

@Repository
public interface DesignRepository extends JpaRepository<Design, Integer> {
    List<Design> findByOwnerId(Integer ownerId);
    List<Design> findByOwnerIdOrderByCreatedAtDesc(Integer ownerId);
    List<Design> findByIsPublicTrueOrderByCreatedAtDesc();
    List<Design> findByIsPublicTrue();

    Long countByIsPublic(Boolean isPublic);
}


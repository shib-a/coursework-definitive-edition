package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.AiModel;

import java.util.List;

@Repository
public interface AiModelRepository extends JpaRepository<AiModel, Integer> {

    List<AiModel> findByIsActiveTrue();

    List<AiModel> findAllByOrderByModelNameAsc();

    @Query("SELECT COUNT(m) FROM AiModel m WHERE m.isActive = true")
    Long countActiveModels();
}


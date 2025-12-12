package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.GenerationTheme;

import java.util.List;

@Repository
public interface GenerationThemeRepository extends JpaRepository<GenerationTheme, Integer> {

    List<GenerationTheme> findByIsActiveTrue();

    List<GenerationTheme> findAllByOrderByThemeNameAsc();
}


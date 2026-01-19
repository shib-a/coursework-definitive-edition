package ru.itmo.kursach_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.itmo.kursach_back.entity.Design;

import java.util.List;
import java.util.Map;

@Repository
public interface DesignRepository extends JpaRepository<Design, Integer> {
    List<Design> findByOwnerId(Integer ownerId);
    List<Design> findByOwnerIdOrderByCreatedAtDesc(Integer ownerId);
    List<Design> findByIsPublicTrueOrderByCreatedAtDesc();
    List<Design> findByIsPublicTrue();

    Long countByIsPublic(Boolean isPublic);

    @Query(value = "SELECT * FROM is.get_popular_designs(:limit)", nativeQuery = true)
    List<Map<String, Object>> getPopularDesigns(@Param("limit") Integer limit);

    @Query(value = "SELECT is.is_popular_design(:designId)", nativeQuery = true)
    Boolean isPopularDesign(@Param("designId") Integer designId);

    @Query(value = "SELECT * FROM is.get_design_stats(:designId)", nativeQuery = true)
    Map<String, Object> getDesignStats(@Param("designId") Integer designId);
}


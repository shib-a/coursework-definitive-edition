package ru.itmo.kursach_back.repository;

import org.springframework.data.repository.CrudRepository;
import ru.itmo.kursach_back.entity.ImageData;

import java.util.List;

public interface ImageDataRepository<T, ID> extends CrudRepository<ImageData, Integer> {
    List<ImageData> findByUploaderId(Integer uploaderId);
    List<ImageData> findByIsPublicTrue();
    List<ImageData> findByIsPublicTrueOrderByCreatedAtDesc();
}

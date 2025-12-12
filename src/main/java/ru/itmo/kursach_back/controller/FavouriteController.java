package ru.itmo.kursach_back.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.kursach_back.dto.response.DesignResponseDto;
import ru.itmo.kursach_back.service.FavouriteService;

import java.util.List;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
public class FavouriteController {

    private final FavouriteService favouriteService;

        @PostMapping("/{designId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addToFavourites(@PathVariable Integer designId) {
        try {
            favouriteService.addToFavourites(designId);
            return ResponseEntity.ok("Design added to favorites");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding to favorites: " + e.getMessage());
        }
    }

        @DeleteMapping("/{designId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeFromFavourites(@PathVariable Integer designId) {
        try {
            favouriteService.removeFromFavourites(designId);
            return ResponseEntity.ok("Design removed from favorites");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error removing from favorites: " + e.getMessage());
        }
    }

        @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyFavourites() {
        try {
            List<DesignResponseDto> favourites = favouriteService.getMyFavourites();
            return ResponseEntity.ok(favourites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving favorites: " + e.getMessage());
        }
    }
}


package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.dto.response.DesignResponseDto;
import ru.itmo.kursach_back.entity.Design;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.entity.UserFavourite;
import ru.itmo.kursach_back.repository.UserFavouriteRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavouriteService {

    private final UserFavouriteRepository favouriteRepository;
    private final DesignService designService;
    private final AuthService authService;

        @Transactional
    public void addToFavourites(Integer designId) {
        User currentUser = authService.getCurrentUser();

        designService.findDesignById(designId)
                .orElseThrow(() -> new RuntimeException("Design not found"));

        if (favouriteRepository.findByUserIdAndDesignId(currentUser.getUserId(), designId).isPresent()) {
            throw new RuntimeException("Design already in favorites");
        }

        UserFavourite favourite = new UserFavourite();
        favourite.setUserId(currentUser.getUserId());
        favourite.setDesignId(designId);
        favourite.setAddedAt(LocalDateTime.now());

        favouriteRepository.save(favourite);
    }

        @Transactional
    public void removeFromFavourites(Integer designId) {
        User currentUser = authService.getCurrentUser();
        favouriteRepository.deleteByUserIdAndDesignId(currentUser.getUserId(), designId);
    }

        public List<DesignResponseDto> getMyFavourites() {
        User currentUser = authService.getCurrentUser();
        List<UserFavourite> favourites = favouriteRepository.findByUserId(currentUser.getUserId());

        return favourites.stream()
                .map(favourite -> {
                    try {
                        Design design = designService.findDesignById(favourite.getDesignId())
                                .orElse(null);
                        if (design != null) {
                            return convertToDto(design);
                        }
                        return null;
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    private DesignResponseDto convertToDto(Design design) {
        DesignResponseDto dto = new DesignResponseDto();
        dto.setDesignId(design.getDesignId());

        if (design.getImageId() != null) {
            dto.setImageUrl("/api/designs/" + design.getDesignId() + "/image");
        }
        dto.setPrompt(design.getOriginalPrompt());
        dto.setStatus("COMPLETED");
        dto.setUserId(design.getOwnerId());
        dto.setCreatedAt(design.getCreatedAt() != null ? design.getCreatedAt().toString() : null);
        return dto;
    }
}


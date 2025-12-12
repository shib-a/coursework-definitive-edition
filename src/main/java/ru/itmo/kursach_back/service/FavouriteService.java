package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.dto.response.DesignResponseDto;
import ru.itmo.kursach_back.entity.Design;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.entity.UserFavourite;
import ru.itmo.kursach_back.repository.DesignRepository;
import ru.itmo.kursach_back.repository.UserFavouriteRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavouriteService {

    private final UserFavouriteRepository favouriteRepository;
    private final DesignRepository designRepository;
    private final AuthService authService;

        @Transactional
    public void addToFavourites(Integer designId) {
        User currentUser = authService.getCurrentUser();

        if (!designRepository.existsById(designId)) {
            throw new RuntimeException("Design not found");
        }

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

        List<Integer> designIds = favourites.stream()
                .map(UserFavourite::getDesignId)
                .collect(Collectors.toList());

        List<Design> designs = designRepository.findAllById(designIds);

        return designs.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private DesignResponseDto convertToDto(Design design) {
        DesignResponseDto dto = new DesignResponseDto();
        dto.setDesignId(design.getDesignId());

        dto.setImageUrl(null); // TODO: Implement image URL generation via ImageData relationship
        dto.setPrompt(design.getOriginalPrompt());
        dto.setStatus(null); // Status is tracked in GenerationRequest, not Design
        dto.setUserId(design.getOwnerId());
        dto.setCreatedAt(design.getCreatedAt() != null ? design.getCreatedAt().toString() : null);
        return dto;
    }
}


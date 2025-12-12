package ru.itmo.kursach_back.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.kursach_back.dto.request.CreateAddressRequest;
import ru.itmo.kursach_back.dto.request.UpdateAddressRequest;
import ru.itmo.kursach_back.entity.Address;
import ru.itmo.kursach_back.entity.Country;
import ru.itmo.kursach_back.repository.CountryRepository;
import ru.itmo.kursach_back.service.AddressService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final CountryRepository countryRepository;

        @GetMapping("/countries")
    public ResponseEntity<?> getAllCountries() {
        try {
            List<Country> countries = countryRepository.findAllByOrderByCountryNameAsc();
            return ResponseEntity.ok(countries);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving countries: " + e.getMessage()));
        }
    }

        @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserAddresses() {
        try {
            List<Address> addresses = addressService.getUserAddresses();
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving addresses: " + e.getMessage()));
        }
    }

        @GetMapping("/default")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDefaultAddress() {
        try {
            return addressService.getDefaultAddress()
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving default address: " + e.getMessage()));
        }
    }

        @GetMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAddressById(@PathVariable Integer addressId) {
        try {
            return addressService.getAddressById(addressId)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "Address not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error retrieving address: " + e.getMessage()));
        }
    }

        @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createAddress(@Valid @RequestBody CreateAddressRequest request) {
        try {
            Address address = addressService.createAddress(
                    request.getCountryId(),
                    request.getCity(),
                    request.getStreetAddress(),
                    request.getPostalCode(),
                    request.getIsDefault()
            );
            return ResponseEntity.ok(address);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating address: " + e.getMessage()));
        }
    }

        @PutMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateAddress(
            @PathVariable Integer addressId,
            @Valid @RequestBody UpdateAddressRequest request) {
        try {
            Address address = addressService.updateAddress(
                    addressId,
                    request.getCountryId(),
                    request.getCity(),
                    request.getStreetAddress(),
                    request.getPostalCode()
            );
            return ResponseEntity.ok(address);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error updating address: " + e.getMessage()));
        }
    }

        @PutMapping("/{addressId}/default")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> setAsDefault(@PathVariable Integer addressId) {
        try {
            Address address = addressService.setAsDefault(addressId);
            return ResponseEntity.ok(address);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error setting default address: " + e.getMessage()));
        }
    }

        @DeleteMapping("/{addressId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAddress(@PathVariable Integer addressId) {
        try {
            addressService.deleteAddress(addressId);
            return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error deleting address: " + e.getMessage()));
        }
    }
}


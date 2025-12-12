package ru.itmo.kursach_back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.kursach_back.entity.Address;
import ru.itmo.kursach_back.entity.User;
import ru.itmo.kursach_back.repository.AddressRepository;
import ru.itmo.kursach_back.repository.CountryRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final CountryRepository countryRepository;
    private final AuthService authService;

        public List<Address> getUserAddresses() {
        User currentUser = authService.getCurrentUser();
        return addressRepository.findByUserId(currentUser.getUserId());
    }

        public Optional<Address> getDefaultAddress() {
        User currentUser = authService.getCurrentUser();
        return addressRepository.findByUserIdAndIsDefaultTrue(currentUser.getUserId());
    }

        public Optional<Address> getAddressById(Integer addressId) {
        User currentUser = authService.getCurrentUser();
        return addressRepository.findById(addressId)
                .filter(address -> address.getUserId().equals(currentUser.getUserId()));
    }

        @Transactional
    public Address createAddress(Integer countryId, String city, String streetAddress,
                                  String postalCode, Boolean isDefault) {
        User currentUser = authService.getCurrentUser();

        countryRepository.findById(countryId)
                .orElseThrow(() -> new RuntimeException("Country not found"));

        if (isDefault != null && isDefault) {
            unsetAllDefaults(currentUser.getUserId());
        }

        Address address = new Address();
        address.setUserId(currentUser.getUserId());
        address.setCountryId(countryId);
        address.setCity(city);
        address.setStreetAddress(streetAddress);
        address.setPostalCode(postalCode);
        address.setIsDefault(isDefault != null ? isDefault : false);

        return addressRepository.save(address);
    }

        @Transactional
    public Address updateAddress(Integer addressId, Integer countryId, String city,
                                  String streetAddress, String postalCode) {
        User currentUser = authService.getCurrentUser();

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied");
        }

        countryRepository.findById(countryId)
                .orElseThrow(() -> new RuntimeException("Country not found"));

        address.setCountryId(countryId);
        address.setCity(city);
        address.setStreetAddress(streetAddress);
        address.setPostalCode(postalCode);

        return addressRepository.save(address);
    }

        @Transactional
    public Address setAsDefault(Integer addressId) {
        User currentUser = authService.getCurrentUser();

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied");
        }

        unsetAllDefaults(currentUser.getUserId());

        address.setIsDefault(true);
        return addressRepository.save(address);
    }

        @Transactional
    public void deleteAddress(Integer addressId) {
        User currentUser = authService.getCurrentUser();

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied");
        }

        addressRepository.delete(address);
    }

    private void unsetAllDefaults(Integer userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            if (addr.getIsDefault() != null && addr.getIsDefault()) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}


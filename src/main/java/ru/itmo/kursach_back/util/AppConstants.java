package ru.itmo.kursach_back.util;

public final class AppConstants {

    private AppConstants() {
    }

    // Validation constants
    public static final int USERNAME_MAX_LENGTH = 100;
    public static final int LOGIN_MAX_LENGTH = 255;
    public static final int PASSWORD_MIN_LENGTH = 6;
    public static final int PASSWORD_MAX_LENGTH = 255;
    
    // Pagination constants
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE_STR = "20";
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "DESC";
    
    // Image generation constants
    public static final String DEFAULT_IMAGE_SIZE = "1024x1024";
    public static final int DEFAULT_IMAGE_WIDTH = 1024;
    public static final int DEFAULT_IMAGE_HEIGHT = 1024;
    
    // Order constants
    public static final String ORDER_NUMBER_PREFIX = "ORD-";
    public static final String TICKET_NUMBER_PREFIX = "TKT-";
    
    // Popular design thresholds
    public static final int POPULAR_FAVORITES_THRESHOLD = 5;
    public static final int POPULAR_ORDERS_THRESHOLD = 3;
    public static final int DEFAULT_POPULAR_DESIGNS_LIMIT = 10;
    
    // API messages
    public static final String RESOURCE_NOT_FOUND = "%s not found with %s: '%s'";
    public static final String ACCESS_DENIED = "Access denied to %s with id %s";
    public static final String DUPLICATE_RESOURCE = "%s already exists with %s: '%s'";
    
    // Error messages
    public static final String USERNAME_REQUIRED = "Username is required";
    public static final String LOGIN_REQUIRED = "Login is required";
    public static final String PASSWORD_REQUIRED = "Password is required";
    public static final String INVALID_CREDENTIALS = "Invalid username or password";
    
    // Success messages
    public static final String DESIGN_DELETED = "Design deleted successfully";
    public static final String CART_CLEARED = "Cart cleared successfully";
    public static final String ITEM_REMOVED = "Item removed from cart";
}

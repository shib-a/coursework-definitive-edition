

export const colorNameToHex = (colorName) => {
    const colorMap = {
        'Белый': '#ffffff',
        'Черный': '#000000',
        'Серый': '#808080',
        'Красный': '#ff0000',
        'Синий': '#0000ff',
        'Зеленый': '#00ff00',
        'Желтый': '#ffff00',
        'Оранжевый': '#ffa500',
        'Розовый': '#ffc0cb',
        'Фиолетовый': '#800080',
        'Коричневый': '#a52a2a',
        'Бежевый': '#f5f5dc',
    };

    if (colorName && colorName.startsWith('#')) {
        return colorName;
    }

    return colorMap[colorName] || '#ffffff';
};


export const hexToColorName = (hexCode) => {
    const reverseMap = {
        '#ffffff': 'Белый',
        '#000000': 'Черный',
        '#808080': 'Серый',
        '#ff0000': 'Красный',
        '#0000ff': 'Синий',
        '#00ff00': 'Зеленый',
        '#ffff00': 'Желтый',
        '#ffa500': 'Оранжевый',
        '#ffc0cb': 'Розовый',
        '#800080': 'Фиолетовый',
        '#a52a2a': 'Коричневый',
        '#f5f5dc': 'Бежевый',
    };

    return reverseMap[hexCode.toLowerCase()] || hexCode;
};


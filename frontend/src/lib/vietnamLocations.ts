export interface ProvinceData {
  name: string;
  districts: {
    name: string;
    wards: string[];
  }[];
}

export const VIETNAM_LOCATIONS: ProvinceData[] = [
  {
    name: 'Hà Nội',
    districts: [
      {
        name: 'Thạch Thất',
        wards: [
          'Thạch Hòa',
          'Tân Xã',
          'Hạ Bằng',
          'Bình Yên',
          'Đồng Trúc',
          'Tiến Xuân',
          'Yên Bình',
          'Yên Trung',
          'Cần Kiệm',
          'Chàng Sơn',
          'Dị Nậu',
          'Canh Nậu',
          'Kim Quan',
          'Hương Ngải',
          'Bình Phú',
          'Liên Quan'
        ]
      },
      {
        name: 'Quốc Oai',
        wards: [
          'Phú Cát',
          'Đông Yên',
          'Hòa Thạch',
          'Phú Mãn',
          'Thị trấn Quốc Oai',
          'Thạch Thán',
          'Ngọc Mỹ',
          'Ngọc Liệp',
          'Tuyết Nghĩa',
          'Cấn Hữu'
        ]
      },
      {
        name: 'Cầu Giấy',
        wards: [
          'Dịch Vọng Hậu',
          'Dịch Vọng',
          'Mai Dịch',
          'Quan Hoa',
          'Nghĩa Đô',
          'Nghĩa Tân',
          'Trung Hòa',
          'Yên Hòa'
        ]
      },
      {
        name: 'Đống Đa',
        wards: [
          'Láng Thượng',
          'Láng Hạ',
          'Quang Trung',
          'Ô Chợ Dừa',
          'Trung Liệt',
          'Chùa Bộc',
          'Kim Liên',
          'Nam Đồng',
          'Phương Mai',
          'Thịnh Quang',
          'Thổ Quan',
          'Văn Miếu'
        ]
      },
      {
        name: 'Hai Bà Trưng',
        wards: [
          'Bách Khoa',
          'Đồng Tâm',
          'Lê Đại Hành',
          'Minh Khai',
          'Trương Định',
          'Vĩnh Tuy',
          'Bạch Mai',
          'Thanh Nhàn',
          'Phố Huế',
          'Đống Mác'
        ]
      },
      {
        name: 'Nam Từ Liêm',
        wards: [
          'Mỹ Đình 1',
          'Mỹ Đình 2',
          'Mễ Trì',
          'Cầu Diễn',
          'Phú Đô',
          'Trung Văn',
          'Tây Mỗ',
          'Đại Mỗ',
          'Phương Canh',
          'Xuân Phương'
        ]
      },
      {
        name: 'Bắc Từ Liêm',
        wards: [
          'Cổ Nhuế 1',
          'Cổ Nhuế 2',
          'Xuân Đỉnh',
          'Minh Khai',
          'Phúc Diễn',
          'Đông Ngạc',
          'Đức Thắng',
          'Thụy Phương',
          'Tây Tựu',
          'Xuân Tảo'
        ]
      },
      {
        name: 'Thanh Xuân',
        wards: [
          'Thanh Xuân Bắc',
          'Thanh Xuân Nam',
          'Thanh Xuân Trung',
          'Khương Mai',
          'Thượng Đình',
          'Nhân Chính',
          'Phương Liệt',
          'Khương Trung',
          'Khương Đình',
          'Kim Giang'
        ]
      },
      {
        name: 'Hà Đông',
        wards: [
          'Mộ Lao',
          'Văn Quán',
          'Hà Cầu',
          'La Khê',
          'Dương Nội',
          'Kiến Hưng',
          'Yên Nghĩa',
          'Phúc La',
          'Vạn Phúc',
          'Quang Trung'
        ]
      },
      {
        name: 'Ba Đình',
        wards: [
          'Kim Mã',
          'Giảng Võ',
          'Ngọc Khánh',
          'Đội Cấn',
          'Liễu Giai',
          'Cống Vị',
          'Vĩnh Phúc',
          'Điện Biên'
        ]
      },
      {
        name: 'Hoàn Kiếm',
        wards: [
          'Hàng Bạc',
          'Hàng Gai',
          'Hàng Đào',
          'Tràng Tiền',
          'Lý Thái Tổ',
          'Cửa Nam',
          'Hàng Trống'
        ]
      },
      {
        name: 'Tây Hồ',
        wards: [
          'Quảng An',
          'Xuân La',
          'Bưởi',
          'Thụy Khuê',
          'Yên Phụ',
          'Nhật Tân',
          'Phú Thượng'
        ]
      },
      {
        name: 'Hoàng Mai',
        wards: [
          'Định Công',
          'Hoàng Liệt',
          'Giáp Bát',
          'Tân Mai',
          'Tương Mai',
          'Mai Động',
          'Vĩnh Hưng'
        ]
      },
      {
        name: 'Gia Lâm',
        wards: [
          'Thị trấn Trâu Quỳ',
          'Đa Tốn',
          'Bát Tràng',
          'Kiêu Kỵ',
          'Yên Thường',
          'Cổ Bi'
        ]
      },
      {
        name: 'Hoài Đức',
        wards: [
          'Thị trấn Trạm Trôi',
          'An Khánh',
          'Vân Canh',
          'Đức Giang',
          'Kim Chung',
          'Song Phương'
        ]
      }
    ]
  },
  {
    name: 'TP. Hồ Chí Minh',
    districts: [
      {
        name: 'TP. Thủ Đức',
        wards: [
          'Linh Trung',
          'Linh Xuân',
          'Hiệp Phú',
          'Tăng Nhơn Phú A',
          'Tăng Nhơn Phú B',
          'Long Thạnh Mỹ',
          'Phước Long B',
          'Bình Thọ',
          'Tam Phú',
          'Linh Chiểu',
          'Linh Tây',
          'Linh Đông',
          'Trường Thọ'
        ]
      },
      {
        name: 'Quận 10',
        wards: [
          'Phường 12',
          'Phường 14',
          'Phường 15',
          'Phường 9',
          'Phường 10',
          'Phường 11',
          'Phường 1',
          'Phường 2'
        ]
      },
      {
        name: 'Quận 7',
        wards: [
          'Tân Phong',
          'Tân Phú',
          'Tân Kiểng',
          'Tân Quy',
          'Bình Thuận',
          'Phú Thuận',
          'Phú Mỹ'
        ]
      },
      {
        name: 'Bình Thạnh',
        wards: [
          'Phường 25',
          'Phường 26',
          'Phường 15',
          'Phường 17',
          'Phường 19',
          'Phường 21',
          'Phường 24',
          'Phường 27'
        ]
      },
      {
        name: 'Gò Vấp',
        wards: [
          'Phường 4',
          'Phường 5',
          'Phường 7',
          'Phường 10',
          'Phường 11',
          'Phường 14',
          'Phường 16'
        ]
      },
      {
        name: 'Quận 5',
        wards: [
          'Phường 2',
          'Phường 3',
          'Phường 4',
          'Phường 8',
          'Phường 9',
          'Phường 11',
          'Phường 14'
        ]
      },
      {
        name: 'Quận 1',
        wards: [
          'Bến Nghé',
          'Bến Thành',
          'Cô Giang',
          'Đa Kao',
          'Tân Định',
          'Phạm Ngũ Lão'
        ]
      },
      {
        name: 'Quận 3',
        wards: [
          'Võ Thị Sáu',
          'Phường 9',
          'Phường 11',
          'Phường 12',
          'Phường 14'
        ]
      },
      {
        name: 'Tân Bình',
        wards: [
          'Phường 2',
          'Phường 4',
          'Phường 12',
          'Phường 13',
          'Phường 15'
        ]
      },
      {
        name: 'Tân Phú',
        wards: [
          'Sơn Kỳ',
          'Tây Thạnh',
          'Tân Sơn Nhì',
          'Phú Thọ Hòa',
          'Hòa Thạnh'
        ]
      }
    ]
  },
  {
    name: 'Đà Nẵng',
    districts: [
      {
        name: 'Ngũ Hành Sơn',
        wards: [
          'Hòa Hải',
          'Hòa Quý',
          'Mỹ An',
          'Khuê Mỹ'
        ]
      },
      {
        name: 'Hải Châu',
        wards: [
          'Hải Châu 1',
          'Hải Châu 2',
          'Thạch Thang',
          'Hòa Cường Nam',
          'Hòa Cường Bắc',
          'Bình Thuận',
          'Thuận Phước'
        ]
      },
      {
        name: 'Liên Chiểu',
        wards: [
          'Hòa Khánh Bắc',
          'Hòa Khánh Nam',
          'Hòa Minh',
          'Hòa Hiệp Bắc',
          'Hòa Hiệp Nam'
        ]
      },
      {
        name: 'Sơn Trà',
        wards: [
          'An Hải Bắc',
          'An Hải Tây',
          'Phước Mỹ',
          'Thọ Quang',
          'Nại Hiên Đông'
        ]
      },
      {
        name: 'Cẩm Lệ',
        wards: [
          'Khuê Trung',
          'Hòa Phát',
          'Hòa An',
          'Hòa Thọ Đông',
          'Hòa Thọ Tây'
        ]
      }
    ]
  },
  {
    name: 'Bình Dương',
    districts: [
      {
        name: 'TP. Dĩ An',
        wards: [
          'Đông Hòa',
          'Dĩ An',
          'An Bình',
          'Bình An',
          'Tân Đông Hiệp',
          'Bình Thắng'
        ]
      },
      {
        name: 'TP. Thủ Dầu Một',
        wards: [
          'Phú Hòa',
          'Định Hòa',
          'Hiệp Thành',
          'Phú Lợi',
          'Chánh Nghĩa',
          'Phú Mỹ'
        ]
      },
      {
        name: 'TP. Thuận An',
        wards: [
          'Lái Thiêu',
          'An Phú',
          'Bình Hòa',
          'Thuận Giao'
        ]
      }
    ]
  },
  {
    name: 'Cần Thơ',
    districts: [
      {
        name: 'Ninh Kiều',
        wards: [
          'Xuân Khánh',
          'An Khánh',
          'Hưng Lợi',
          'Cái Khế',
          'An Hòa',
          'Tân An',
          'Thới Bình'
        ]
      },
      {
        name: 'Cái Răng',
        wards: [
          'Lê Bình',
          'Hưng Phú',
          'Hưng Thạnh',
          'Ba Láng'
        ]
      }
    ]
  },
  {
    name: 'Thừa Thiên Huế',
    districts: [
      {
        name: 'TP. Huế',
        wards: [
          'Vĩnh Ninh',
          'Phú Nhuận',
          'Phú Hội',
          'Thuận Lộc',
          'Tây Lộc',
          'Phú Hậu'
        ]
      }
    ]
  },
  {
    name: 'Hải Phòng',
    districts: [
      {
        name: 'Ngô Quyền',
        wards: [
          'Máy Chai',
          'Máy Tơ',
          'Vạn Mỹ',
          'Cầu Tre',
          'Lạc Viên'
        ]
      },
      {
        name: 'Lê Chân',
        wards: [
          'An Dương',
          'Lam Sơn',
          'Hồ Nam',
          'Trần Nguyên Hãn'
        ]
      }
    ]
  }
];

export const PROVINCE_LIST = VIETNAM_LOCATIONS.map(p => p.name);

export function getDistrictsByProvince(provinceName?: string): string[] {
  if (!provinceName) return [];
  const found = VIETNAM_LOCATIONS.find(p => p.name.toLowerCase() === provinceName.toLowerCase());
  return found ? found.districts.map(d => d.name) : [];
}

export function getWardsByDistrict(provinceName?: string, districtName?: string): string[] {
  if (!provinceName || !districtName) return [];
  const p = VIETNAM_LOCATIONS.find(p => p.name.toLowerCase() === provinceName.toLowerCase());
  if (!p) return [];
  const d = p.districts.find(d => d.name.toLowerCase() === districtName.toLowerCase());
  return d ? d.wards : [];
}

/**
 * Format numeric value with dot thousand separators (e.g. 2500000 -> "2.500.000")
 */
export function formatCurrencyInput(val?: number | string | null): string {
  if (val === undefined || val === null || val === '') return '';
  const clean = val.toString().replace(/\D/g, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Convert number to human-readable words (e.g. 2500000 -> "2 triệu 500 nghìn ₫")
 */
export function formatAmountWords(val?: number | string | null): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : parseInt(val.toString().replace(/\D/g, '') || '0', 10);
  if (isNaN(num) || num <= 0) return '';

  if (num >= 1000000000) {
    const ty = Math.floor(num / 1000000000);
    const trieu = Math.floor((num % 1000000000) / 1000000);
    return `${ty} tỷ ${trieu > 0 ? `${trieu} triệu` : ''} ₫`.trim();
  }
  if (num >= 1000000) {
    const trieu = Math.floor(num / 1000000);
    const nghin = Math.floor((num % 1000000) / 1000);
    return `${trieu} triệu ${nghin > 0 ? `${nghin} nghìn` : ''} ₫`.trim();
  }
  if (num >= 1000) {
    const nghin = Math.floor(num / 1000);
    return `${nghin} nghìn ₫`;
  }
  return `${num} ₫`;
}

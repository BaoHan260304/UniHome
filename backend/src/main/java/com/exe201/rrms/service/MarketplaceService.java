package com.exe201.rrms.service;
import com.exe201.rrms.entity.*; import com.exe201.rrms.repository.*; import com.exe201.rrms.util.GeoUtil; import org.springframework.stereotype.Service; import java.time.*; import java.util.*; import java.util.stream.*;
@Service public class MarketplaceService {
 private final ListingRepository listings; private final PropertyRepository props; private final VerificationRecordRepository verifs; private final ReviewRepository reviews; private final UserRepository users;
 public MarketplaceService(ListingRepository l,PropertyRepository p,VerificationRecordRepository v,ReviewRepository r,UserRepository u){listings=l;props=p;verifs=v;reviews=r;users=u;}
 public List<Map<String,Object>> search(Map<String,String> q){
   List<Listing> ls=listings.findByStatus("ACTIVE");
   Double lat=parseD(q.get("lat")),lng=parseD(q.get("lng"));
   Double radius=parseD(q.get("radiusKm")!=null?q.get("radiusKm"):q.get("radius"));
   Long min=parseL(q.get("minPrice")),max=parseL(q.get("maxPrice"));
   String text=lower(q.get("search")!=null?q.get("search"):q.get("keyword"));
   String province=lower(q.get("province"));
   String district=lower(q.get("district"));
   String school=lower(q.get("school")!=null?q.get("school"):q.get("university"));
   String ptype=lower(q.get("propertyType")!=null?q.get("propertyType"):q.get("roomType"));
   String verified=lower(q.get("verified")!=null?q.get("verified"):q.get("verification"));
   String furniture=lower(q.get("furniture"));
   String amenity=lower(q.get("amenity")!=null?q.get("amenity"):q.get("amenities"));
   String floor=lower(q.get("floor"));
   String availability=lower(q.get("availability"));
   Integer occupants=parseI(q.get("maxOccupants")!=null?q.get("maxOccupants"):q.get("capacity"));

   List<Map<String,Object>> out=new ArrayList<>();
   for(Listing li:ls){
     Property p=props.findById(li.getPropertyId()).orElse(null);
     if(p==null)continue;
     if(!match(text,p.getName(),p.getDescription(),p.getProvince(),p.getDistrict(),p.getWard(),p.getStreet()))continue;
     if(!contains(p.getProvince(),province)||!contains(p.getDistrict(),district)||!contains(p.getNearestSchool(),school)||!contains(p.getPropertyType(),ptype)||!contains(p.getFurniture(),furniture)||!contains(p.getAmenities(),amenity)||!contains(p.getFloorText(),floor))continue;

     if(availability!=null&&!availability.isBlank()){
       String pAvail=lower(p.getAvailability());
       if(pAvail==null||pAvail.isBlank())pAvail="available";
       if(!contains(pAvail,availability)&&!("available".equals(availability)&&("available_now".equals(pAvail)||"ready".equals(pAvail))))continue;
     }

     if(occupants!=null&&(p.getMaxOccupants()==null||p.getMaxOccupants()<occupants))continue;
     if(min!=null&&p.getPrice()!=null&&p.getPrice()<min)continue;
     if(max!=null&&p.getPrice()!=null&&p.getPrice()>max)continue;
     double distance=GeoUtil.km(lat,lng,p.getLatitude(),p.getLongitude());
     if(radius!=null&&lat!=null&&lng!=null&&distance>radius)continue;
     Map<String,Object> m=detail(li,p);
     m.put("distanceKm",distance==Double.MAX_VALUE?null:Math.round(distance*10.0)/10.0);
     boolean isV="ON_SITE_VERIFIED".equals(m.get("verificationLevel"))||"REMOTE_VERIFIED".equals(m.get("verificationLevel"));
     if("true".equals(verified)&&!isV)continue;
     out.add(m);
   }
   String sort=q.getOrDefault("sort","RELEVANCE");
   Comparator<Map<String,Object>> cmp=Comparator.comparingInt(a->-(Integer)a.get("rankScore"));
   if("PRICE_ASC".equals(sort))cmp=Comparator.comparingLong(a->((Number)a.getOrDefault("price",0L)).longValue());
   else if("PRICE_DESC".equals(sort))cmp=Comparator.comparingLong((Map<String,Object>a)->((Number)a.getOrDefault("price",0L)).longValue()).reversed();
   else if("DISTANCE".equals(sort))cmp=Comparator.comparingDouble(a->a.get("distanceKm")==null?Double.MAX_VALUE:((Number)a.get("distanceKm")).doubleValue());
   else if("NEWEST".equals(sort))cmp=Comparator.comparing((Map<String,Object>a)->(LocalDateTime)a.get("updatedAt"),Comparator.nullsLast(Comparator.naturalOrder())).reversed();
   out.sort(cmp);
   return out;
 }
 public Map<String,Object> searchPaged(Map<String,String> q){
   List<Map<String,Object>> filtered=search(q);
   int totalElements=filtered.size();
   int page=Math.max(0,parseI(q.get("page"))!=null?parseI(q.get("page")):0);
   int size=Math.max(1,parseI(q.get("size"))!=null?parseI(q.get("size")):12);
   int totalPages=size>0?(int)Math.ceil((double)totalElements/size):1;
   int start=Math.min(page*size,totalElements);
   int end=Math.min(start+size,totalElements);
   List<Map<String,Object>> content=filtered.subList(start,end);

   Map<String,Object> res=new LinkedHashMap<>();
   res.put("content",content);
   res.put("page",page);
   res.put("size",size);
   res.put("totalElements",totalElements);
   res.put("totalPages",totalPages);
   res.put("first",page==0);
   res.put("last",page>=totalPages-1);
   return res;
 }
 public Map<String,Object> detailByListing(Long id){ Listing li=listings.findById(id).orElseThrow(); Property p=props.findById(li.getPropertyId()).orElseThrow(); return detail(li,p); }
  public Map<String,Object> detail(Listing li,Property p){ Map<String,Object> m=new LinkedHashMap<>(); User landlord=li.getLandlordId()!=null?users.findById(li.getLandlordId()).orElse(null):null; m.put("id",li.getId());m.put("listingId",li.getId());m.put("propertyId",p.getId());m.put("landlordId",li.getLandlordId());m.put("landlordStatus",landlord!=null?landlord.getStatus():null);m.put("landlordName",landlord!=null?landlord.getFullName():null);m.put("title",li.getTitle()!=null?li.getTitle():p.getName());m.put("name",p.getName());m.put("province",p.getProvince());m.put("district",p.getDistrict());m.put("ward",p.getWard());m.put("street",p.getStreet());m.put("latitude",p.getLatitude());m.put("longitude",p.getLongitude());m.put("price",p.getPrice());m.put("area",p.getArea());m.put("deposit",p.getDeposit());m.put("electricityPrice",p.getElectricityPrice());m.put("waterPrice",p.getWaterPrice());m.put("internetPrice",p.getInternetPrice());m.put("parkingFee",p.getParkingFee());m.put("otherFees",p.getOtherFees());m.put("furniture",p.getFurniture());m.put("propertyType",p.getPropertyType());m.put("postType",p.getPostType());m.put("totalRooms",p.getTotalRooms());m.put("totalFloors",p.getTotalFloors());m.put("floorText",p.getFloorText());m.put("maxOccupants",p.getMaxOccupants());m.put("nearestSchool",p.getNearestSchool());m.put("nearestSchoolDistanceKm",p.getNearestSchoolDistanceKm());m.put("amenities",p.getAmenities());m.put("rules",p.getRules());m.put("availability",p.getAvailability());m.put("lastAvailabilityConfirmedAt",p.getLastAvailabilityConfirmedAt());m.put("description",p.getDescription());m.put("imageUrl",p.getImageUrl());m.put("packageTier",li.getPackageTier());m.put("packageUntil",li.getPackageUntil());m.put("boostUntil",li.getBoostUntil());m.put("status",li.getStatus());m.put("updatedAt",li.getUpdatedAt());m.put("viewCount",li.getViewCount());m.put("interestCount",li.getInterestCount());
  VerificationRecord v=verifs.findByListingIdOrderByCreatedAtDesc(li.getId()).stream().filter(x->"VERIFIED".equals(x.getStatus())).findFirst().orElse(null); m.put("verificationLevel",v==null?"CONTENT_REVIEWED":v.getLevel());m.put("verification",v); List<Review> rs=reviews.findByPropertyIdAndStatusOrderByCreatedAtDesc(p.getId(),"VISIBLE");m.put("reviews",rs); double avg=rs.stream().filter(r->r.getRating()!=null).mapToInt(Review::getRating).average().orElse(0);m.put("rating",Math.round(avg*10)/10.0); int rank=100+(li.getPackagePriority()==null?0:li.getPackagePriority()); if(li.getBoostUntil()!=null&&li.getBoostUntil().isAfter(LocalDateTime.now()))rank+=30; if(v!=null&&"ON_SITE_VERIFIED".equals(v.getLevel()))rank+=20; m.put("rankScore",rank);return m; }
 private boolean match(String q,String...xs){ if(q==null||q.isBlank())return true; for(String x:xs)if(x!=null&&x.toLowerCase().contains(q))return true;return false;} private boolean contains(String x,String q){return q==null||q.isBlank()||(x!=null&&x.toLowerCase().contains(q));} private String lower(String s){return s==null?null:s.toLowerCase();} private Long parseL(String s){try{return s==null||s.isBlank()?null:Long.valueOf(s);}catch(Exception e){return null;}} private Double parseD(String s){try{return s==null||s.isBlank()?null:Double.valueOf(s);}catch(Exception e){return null;}} private Integer parseI(String s){try{return s==null||s.isBlank()?null:Integer.valueOf(s);}catch(Exception e){return null;}}
}

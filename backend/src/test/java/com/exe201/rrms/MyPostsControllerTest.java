package com.exe201.rrms;

import com.exe201.rrms.controller.MyPostsController;
import com.exe201.rrms.entity.Listing;
import com.exe201.rrms.entity.Property;
import com.exe201.rrms.entity.SecondHandListing;
import com.exe201.rrms.entity.ServiceListing;
import com.exe201.rrms.entity.User;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class MyPostsControllerTest {

    private AuthService auth;
    private ListingRepository listings;
    private PropertyRepository props;
    private SecondHandListingRepository secondHandRepo;
    private ServiceListingRepository serviceRepo;
    private FavoriteRepository favs;
    private ListingInterestRepository interests;
    private ConversationRepository convs;

    private MyPostsController controller;

    @BeforeEach
    void setup() {
        auth = Mockito.mock(AuthService.class);
        listings = Mockito.mock(ListingRepository.class);
        props = Mockito.mock(PropertyRepository.class);
        secondHandRepo = Mockito.mock(SecondHandListingRepository.class);
        serviceRepo = Mockito.mock(ServiceListingRepository.class);
        favs = Mockito.mock(FavoriteRepository.class);
        interests = Mockito.mock(ListingInterestRepository.class);
        convs = Mockito.mock(ConversationRepository.class);

        controller = new MyPostsController(auth, listings, props, secondHandRepo, serviceRepo, favs, interests, convs);
    }

    @Test
    void testUnauthenticatedReturnsEmptyList() {
        HttpServletRequest req = Mockito.mock(HttpServletRequest.class);
        when(auth.optional(req)).thenReturn(null);

        List<Map<String, Object>> result = controller.getMyPosts(req);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testUserWithNoPostsReturnsEmptyList() {
        HttpServletRequest req = Mockito.mock(HttpServletRequest.class);
        User u = new User();
        u.setId(99L);
        when(auth.optional(req)).thenReturn(u);
        when(listings.findByLandlordIdOrderByUpdatedAtDesc(99L)).thenReturn(Collections.emptyList());
        when(secondHandRepo.findBySellerIdOrderByCreatedAtDesc(99L)).thenReturn(Collections.emptyList());
        when(serviceRepo.findByProviderIdOrderByCreatedAtDesc(99L)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> result = controller.getMyPosts(req);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testStandardizedContractForRoomAndRoommate() {
        HttpServletRequest req = Mockito.mock(HttpServletRequest.class);
        User u = new User();
        u.setId(10L);
        when(auth.optional(req)).thenReturn(u);

        // Room post
        Listing l1 = new Listing();
        l1.setId(101L);
        l1.setPropertyId(201L);
        l1.setTitle("Phòng trọ cao cấp");
        l1.setStatus("ACTIVE");
        l1.setViewCount(50L);
        l1.setInterestCount(5L);

        Property p1 = new Property();
        p1.setId(201L);
        p1.setPrice(3500000L);
        p1.setPostType("ROOM_FOR_RENT");
        p1.setPosterRelationship("OWNER");

        // Roommate post
        Listing l2 = new Listing();
        l2.setId(102L);
        l2.setPropertyId(202L);
        l2.setTitle("Tìm bạn ở ghép chung cư");
        l2.setStatus("ACTIVE");
        l2.setViewCount(30L);
        l2.setInterestCount(2L);

        Property p2 = new Property();
        p2.setId(202L);
        p2.setPrice(1800000L);
        p2.setPostType("SHARED_ROOM");
        p2.setPosterRelationship("ROOMMATE_SEARCH");

        when(listings.findByLandlordIdOrderByUpdatedAtDesc(10L)).thenReturn(List.of(l1, l2));
        when(props.findById(201L)).thenReturn(Optional.of(p1));
        when(props.findById(202L)).thenReturn(Optional.of(p2));
        when(secondHandRepo.findBySellerIdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());
        when(serviceRepo.findByProviderIdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> result = controller.getMyPosts(req);
        assertEquals(2, result.size());

        // Assert contract fields
        Map<String, Object> room = result.stream().filter(r -> r.get("id").equals(101L)).findFirst().orElseThrow();
        assertEquals(101L, room.get("id"));
        assertEquals(101L, room.get("targetId"));
        assertEquals("ROOM", room.get("category"));
        assertEquals("OWNER", room.get("relationship"));
        assertEquals(50L, room.get("viewCount"));
        assertNotNull(room.get("favoriteCount"));
        assertNotNull(room.get("chatCount"));

        Map<String, Object> roommate = result.stream().filter(r -> r.get("id").equals(102L)).findFirst().orElseThrow();
        assertEquals(102L, roommate.get("id"));
        assertEquals(102L, roommate.get("targetId"));
        assertEquals("ROOMMATE", roommate.get("category"));
        assertEquals("ROOMMATE_SEARCH", roommate.get("relationship"));
    }

    @Test
    void testErrorInOneCategoryDoesNotCrashEndpoint() {
        HttpServletRequest req = Mockito.mock(HttpServletRequest.class);
        User u = new User();
        u.setId(20L);
        when(auth.optional(req)).thenReturn(u);

        // listings throws exception
        when(listings.findByLandlordIdOrderByUpdatedAtDesc(20L)).thenThrow(new RuntimeException("DB Connection Timeout"));

        // second hand works fine
        SecondHandListing sh = new SecondHandListing();
        sh.setId(301L);
        sh.setTitle("Nồi cơm điện Cuckoo");
        sh.setPrice(300000L);
        sh.setStatus("ACTIVE");
        when(secondHandRepo.findBySellerIdOrderByCreatedAtDesc(20L)).thenReturn(List.of(sh));
        when(serviceRepo.findByProviderIdOrderByCreatedAtDesc(20L)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> result = controller.getMyPosts(req);
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(301L, result.get(0).get("id"));
        assertEquals("SECOND_HAND", result.get(0).get("category"));
    }
}

package com.learningportal.app.controller;

import com.learningportal.app.dto.ApiResponse;
import com.learningportal.app.dto.BookmarkDTO;
import com.learningportal.app.dto.BookmarkRequest;
import com.learningportal.app.repository.UserRepository;
import com.learningportal.app.service.BookmarkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final UserRepository userRepository;

    // Get all bookmarks for a specific video (current user)
    @GetMapping("/video/{videoId}")
    public ResponseEntity<ApiResponse<List<BookmarkDTO>>> getBookmarksForVideo(
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                bookmarkService.getBookmarksForVideo(userId, videoId)));
    }

    // Get all bookmarks across all videos (current user)
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookmarkDTO>>> getAllBookmarks(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                bookmarkService.getAllBookmarksForUser(userId)));
    }

    // Create a new bookmark
    @PostMapping
    public ResponseEntity<ApiResponse<BookmarkDTO>> createBookmark(
            @Valid @RequestBody BookmarkRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        BookmarkDTO created = bookmarkService.createBookmark(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bookmark created", created));
    }

    // Update an existing bookmark
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookmarkDTO>> updateBookmark(
            @PathVariable Long id,
            @Valid @RequestBody BookmarkRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        BookmarkDTO updated = bookmarkService.updateBookmark(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Bookmark updated", updated));
    }

    // Delete a bookmark
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        bookmarkService.deleteBookmark(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Bookmark deleted", null));
    }

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}

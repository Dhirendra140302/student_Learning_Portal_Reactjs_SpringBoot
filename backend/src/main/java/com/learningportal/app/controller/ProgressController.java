package com.learningportal.app.controller;

import com.learningportal.app.dto.ApiResponse;
import com.learningportal.app.dto.WatchProgressDTO;
import com.learningportal.app.dto.WatchProgressRequest;
import com.learningportal.app.repository.UserRepository;
import com.learningportal.app.service.WatchProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final WatchProgressService watchProgressService;
    private final UserRepository userRepository;

    // Save/update watch progress
    @PostMapping
    public ResponseEntity<ApiResponse<WatchProgressDTO>> saveProgress(
            @Valid @RequestBody WatchProgressRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        WatchProgressDTO dto = watchProgressService.saveProgress(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Progress saved", dto));
    }

    // Get progress for a specific video
    @GetMapping("/video/{videoId}")
    public ResponseEntity<ApiResponse<WatchProgressDTO>> getProgressForVideo(
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        WatchProgressDTO dto = watchProgressService.getProgressForVideo(userId, videoId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    // Continue watching list (in-progress videos)
    @GetMapping("/continue-watching")
    public ResponseEntity<ApiResponse<List<WatchProgressDTO>>> getContinueWatching(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                watchProgressService.getContinueWatching(userId)));
    }

    // Recently watched videos
    @GetMapping("/recently-watched")
    public ResponseEntity<ApiResponse<List<WatchProgressDTO>>> getRecentlyWatched(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                watchProgressService.getRecentlyWatched(userId)));
    }

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}
